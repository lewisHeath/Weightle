import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const path = join(process.cwd(), "src/data/objects.json");
  const objects: { imageKey: string; sourceUrl: string }[] = JSON.parse(
    readFileSync(path, "utf-8"),
  );
  const pending = objects.filter((o) => o.imageKey.startsWith("http"));
  const titles = pending.map((o) =>
    decodeURIComponent(o.sourceUrl.replace("https://en.wikipedia.org/wiki/", "")),
  );

  const map = new Map<string, string>();
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const api = new URL("https://en.wikipedia.org/w/api.php");
    api.searchParams.set("action", "query");
    api.searchParams.set("titles", batch.join("|"));
    api.searchParams.set("prop", "pageimages");
    api.searchParams.set("piprop", "original");
    api.searchParams.set("format", "json");
    const res = await fetch(api.toString(), {
      headers: { "User-Agent": "Weightle/1.0" },
    });
    const data = (await res.json()) as {
      query?: {
        pages?: Record<string, { title?: string; original?: { source: string } }>;
      };
    };
    for (const page of Object.values(data.query?.pages ?? {})) {
      if (page.title && page.original?.source) {
        map.set(page.title.replace(/ /g, "_"), page.original.source);
      }
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  let fixed = 0;
  for (const obj of objects) {
    if (!obj.imageKey.startsWith("http")) continue;
    const wiki = decodeURIComponent(
      obj.sourceUrl.replace("https://en.wikipedia.org/wiki/", ""),
    );
    const url = map.get(wiki);
    if (url) {
      obj.imageKey = url;
      fixed++;
    }
  }

  writeFileSync(path, JSON.stringify(objects, null, 2) + "\n");
  const still = objects.filter((o) => o.imageKey.startsWith("http")).length;
  console.log(`Fixed ${fixed}/${pending.length}, still pending ${still}`);
}

main();

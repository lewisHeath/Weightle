/**
 * Repair objects whose imageKey is not a real image URL.
 * Uses Wikimedia Commons search, then uploads via fetch-images flow.
 *
 * Run: npx tsx scripts/repair-broken-images.ts
 * Then: npx tsx scripts/fetch-images.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { WeightleObject } from "../src/lib/types";

const USER_AGENT = "Weightle/1.0 (https://weightle.app; image-repair)";

/** Manual overrides where Commons search is unreliable. */
const OVERRIDES: Record<string, string> = {
  seal: "https://upload.wikimedia.org/wikipedia/commons/7/74/California_sea_lion_in_La_Jolla_%2870568%29.jpg",
  ukulele:
    "https://upload.wikimedia.org/wikipedia/commons/6/6c/17_inch_pocket_ukulele_branded_%22ultnice%22.jpg",
  "mechanical-keyboard":
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Camera_zoom_burst_on_a_Microsoft_computer_keyboard_in_Tuntorp_8.jpg",
  "3d-printer":
    "https://upload.wikimedia.org/wikipedia/commons/3/3e/3D_printing_of_face_shields.jpg",
  "toy-car": "https://upload.wikimedia.org/wikipedia/commons/7/76/HTI_Diecast_car_001.jpg",
  "breath-mints-tin":
    "https://upload.wikimedia.org/wikipedia/commons/7/7f/Diet_Coke_Mentos.jpg",
};

function needsRepair(obj: WeightleObject): boolean {
  if (obj.imageKey.endsWith(".webp") && !obj.imageKey.startsWith("http")) {
    return false;
  }
  if (obj.imageKey.includes("en.wikipedia.org/wiki/")) return true;
  if (/\.(webm|ogv)$/i.test(obj.imageKey)) return true;
  if (obj.imageKey.startsWith("http") && !/\.(webp|jpg|jpeg|png)$/i.test(obj.imageKey)) {
    return true;
  }
  return false;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function commonsImageUrl(search: string): Promise<string | null> {
  const searchApi = new URL("https://commons.wikimedia.org/w/api.php");
  searchApi.searchParams.set("action", "query");
  searchApi.searchParams.set("list", "search");
  searchApi.searchParams.set("srsearch", search);
  searchApi.searchParams.set("srnamespace", "6");
  searchApi.searchParams.set("srlimit", "5");
  searchApi.searchParams.set("format", "json");

  const searchRes = await fetch(searchApi.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!searchRes.ok) return null;
  const searchData = (await searchRes.json()) as {
    query?: { search?: { title: string }[] };
  };
  const hits = searchData.query?.search ?? [];
  if (hits.length === 0) return null;

  for (const hit of hits) {
    const infoApi = new URL("https://commons.wikimedia.org/w/api.php");
    infoApi.searchParams.set("action", "query");
    infoApi.searchParams.set("titles", hit.title);
    infoApi.searchParams.set("prop", "imageinfo");
    infoApi.searchParams.set("iiprop", "url|mime");
    infoApi.searchParams.set("format", "json");

    const infoRes = await fetch(infoApi.toString(), {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!infoRes.ok) continue;
    const infoData = (await infoRes.json()) as {
      query?: {
        pages?: Record<
          string,
          { imageinfo?: { url: string; mime?: string }[] }
        >;
      };
    };
    const page = Object.values(infoData.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];
    if (!info?.url) continue;
    const mime = info.mime ?? "";
    if (mime.startsWith("image/") && !mime.includes("svg")) {
      return info.url;
    }
  }
  return null;
}

async function main() {
  const path = join(process.cwd(), "src/data/objects.json");
  const objects: WeightleObject[] = JSON.parse(readFileSync(path, "utf-8"));
  const toFix = objects.filter(needsRepair);
  console.log(`Repairing ${toFix.length} objects...`);

  let fixed = 0;
  let failed: string[] = [];

  for (const obj of toFix) {
    const override = OVERRIDES[obj.id];
    let url: string | null = override ?? null;

    if (!url) {
      url = await commonsImageUrl(obj.name);
      await sleep(1200);
    }

    if (url) {
      obj.imageKey = url;
      fixed++;
      console.log(`OK ${obj.id}`);
    } else {
      failed.push(obj.id);
      console.warn(`FAIL ${obj.id} (${obj.name})`);
    }
  }

  writeFileSync(path, JSON.stringify(objects, null, 2) + "\n");
  console.log(`\nUpdated objects.json: ${fixed} fixed, ${failed.length} failed`);
  if (failed.length) {
    console.log("Failed IDs:", failed.join(", "));
    console.log("Run fetch-images after fixing, or add manual OVERRIDES.");
  } else {
    console.log("Next: npx tsx scripts/fetch-images.ts");
  }
}

main();

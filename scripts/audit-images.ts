/**
 * Audit object images: CDN availability + valid image URLs.
 * Run: npx tsx scripts/audit-images.ts
 * Writes: scripts/output/image-audit.json
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { WeightleObject } from "../src/lib/types";

const USER_AGENT = "Weightle-Audit/1.0 (https://weightle.app)";
const CDN_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "https://cdn.weightle.app";

type Issue =
  | "wikipedia_page_url"
  | "video_or_unsupported"
  | "cdn_missing"
  | "remote_fetch_failed";

interface AuditEntry {
  id: string;
  name: string;
  imageKey: string;
  resolvedUrl: string;
  issue: Issue;
  httpStatus?: number | string;
}

function getResolvedUrl(obj: WeightleObject): string {
  if (obj.imageKey.startsWith("http")) return obj.imageKey;
  return `${CDN_BASE}/objects/${obj.imageKey}`;
}

function classify(obj: WeightleObject): Issue | null {
  const key = obj.imageKey;
  if (key.includes("en.wikipedia.org/wiki/")) return "wikipedia_page_url";
  if (/\.(webm|ogv|svg)$/i.test(key)) return "video_or_unsupported";
  if (key.startsWith("http")) return "remote_fetch_failed";
  return null;
}

async function head(url: string): Promise<number | string> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
    });
    return res.status;
  } catch (e) {
    return e instanceof Error ? e.message : "error";
  }
}

async function main() {
  const objs: WeightleObject[] = JSON.parse(
    readFileSync(join(process.cwd(), "src/data/objects.json"), "utf-8"),
  );

  const broken: AuditEntry[] = [];
  let cdnOk = 0;

  for (const obj of objs) {
    const issue = classify(obj);
    const resolvedUrl = getResolvedUrl(obj);

    if (issue === "wikipedia_page_url" || issue === "video_or_unsupported") {
      broken.push({
        id: obj.id,
        name: obj.name,
        imageKey: obj.imageKey,
        resolvedUrl,
        issue,
      });
      continue;
    }

    if (issue === "remote_fetch_failed") {
      const status = await head(resolvedUrl);
      if (status !== 200) {
        broken.push({
          id: obj.id,
          name: obj.name,
          imageKey: obj.imageKey,
          resolvedUrl,
          issue,
          httpStatus: status,
        });
      }
      continue;
    }

    const status = await head(resolvedUrl);
    if (status === 200) {
      cdnOk++;
    } else {
      broken.push({
        id: obj.id,
        name: obj.name,
        imageKey: obj.imageKey,
        resolvedUrl,
        issue: "cdn_missing",
        httpStatus: status,
      });
    }
  }

  const outDir = join(process.cwd(), "scripts/output");
  mkdirSync(outDir, { recursive: true });
  const report = {
    auditedAt: new Date().toISOString(),
    total: objs.length,
    cdnOk,
    brokenCount: broken.length,
    byIssue: {
      wikipedia_page_url: broken.filter((b) => b.issue === "wikipedia_page_url")
        .length,
      video_or_unsupported: broken.filter(
        (b) => b.issue === "video_or_unsupported",
      ).length,
      cdn_missing: broken.filter((b) => b.issue === "cdn_missing").length,
      remote_fetch_failed: broken.filter(
        (b) => b.issue === "remote_fetch_failed",
      ).length,
    },
    broken,
  };

  const outPath = join(outDir, "image-audit.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");
  console.log(`Audit complete: ${cdnOk}/${objs.length} CDN OK, ${broken.length} broken`);
  console.log(`Report: ${outPath}`);
  console.log("By issue:", report.byIssue);
}

main();

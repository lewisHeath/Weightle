/**
 * Downloads object images, resizes to WebP, uploads to Cloudflare R2.
 *
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 * Optional: read from ~/.account_id, ~/.access_key_id, ~/.secret_access_key
 *
 * Usage: npx tsx scripts/fetch-images.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

interface ObjectEntry {
  id: string;
  imageKey: string;
  [key: string]: unknown;
}

const USER_AGENT = "Weightle/1.0 (https://weightle.app; image-pipeline)";

function readCredential(envName: string, fileName: string): string | undefined {
  if (process.env[envName]) return process.env[envName];
  try {
    return readFileSync(join(homedir(), fileName), "utf-8").trim();
  } catch {
    return undefined;
  }
}

const accountId = readCredential("R2_ACCOUNT_ID", ".account_id");
const accessKeyId = readCredential("R2_ACCESS_KEY_ID", ".access_key_id");
const secretAccessKey = readCredential("R2_SECRET_ACCESS_KEY", ".secret_access_key");
const bucket = process.env.R2_BUCKET_NAME ?? "weightle-images";

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error(
    "Missing R2 credentials. Set env vars or ~/.account_id, ~/.access_key_id, ~/.secret_access_key",
  );
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const objectsPath = join(process.cwd(), "src/data/objects.json");
const objects: ObjectEntry[] = JSON.parse(readFileSync(objectsPath, "utf-8"));

/** Resolve download URL via Commons API (handles bad paths / thumb links). */
async function resolveDownloadUrl(imageKey: string): Promise<string> {
  const fileName = fileNameFromImageKey(imageKey);
  const titles = [
    `File:${fileName}`,
    `File:${fileName.replace(/_/g, " ")}`,
  ];
  let lastError: Error | undefined;
  for (const title of [...new Set(titles)]) {
    try {
      return await fetchCommonsUrl(title);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError ?? new Error(`Commons file not found for ${fileName}`);
}

async function resolveImageSource(imageKey: string): Promise<string> {
  if (imageKey.startsWith("https://en.wikipedia.org/wiki/")) {
    const title = decodeURIComponent(
      imageKey.replace("https://en.wikipedia.org/wiki/", ""),
    );
    const api = new URL("https://en.wikipedia.org/w/api.php");
    api.searchParams.set("action", "query");
    api.searchParams.set("titles", title);
    api.searchParams.set("prop", "pageimages");
    api.searchParams.set("piprop", "original");
    api.searchParams.set("format", "json");
    const res = await fetch(api.toString(), {
      headers: { "User-Agent": USER_AGENT },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        query?: {
          pages?: Record<string, { original?: { source: string } }>;
        };
      };
      const page = Object.values(data.query?.pages ?? {})[0];
      if (page?.original?.source) return page.original.source;
    }
  }
  return resolveDownloadUrl(imageKey);
}

async function fetchCommonsUrl(title: string): Promise<string> {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  api.searchParams.set("action", "query");
  api.searchParams.set("titles", title);
  api.searchParams.set("prop", "imageinfo");
  api.searchParams.set("iiprop", "url");
  api.searchParams.set("format", "json");

  const res = await fetch(api.toString(), {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`Commons API ${res.status} for ${title}`);
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { missing?: string; imageinfo?: { url: string }[] }> };
  };
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (!page || page.missing || !page.imageinfo?.[0]?.url) {
    throw new Error(`Commons file not found: ${title}`);
  }
  return page.imageinfo[0].url;
}

function fileNameFromImageKey(imageKey: string): string {
  const parts = imageKey.split("/");
  let name = parts[parts.length - 1] ?? "";
  if (/^\d+px-/.test(name)) {
    name = parts[parts.length - 2] ?? name;
  }
  try {
    name = decodeURIComponent(name);
  } catch {
    /* keep as-is */
  }
  return name;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (res.status === 429 && i < retries - 1) {
      await sleep(3000 * (i + 1));
      continue;
    }
    return res;
  }
  throw new Error("unreachable");
}

async function fetchAndUpload(obj: ObjectEntry): Promise<boolean> {
  if (!obj.imageKey.startsWith("http")) {
    console.log(`Skip ${obj.id}: already on R2 (${obj.imageKey})`);
    return false;
  }

  const sourceUrl = obj.imageKey.startsWith("https://upload.wikimedia.org/")
    ? obj.imageKey
    : await resolveImageSource(obj.imageKey);
  const res = await fetchWithRetry(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${obj.id}: ${res.status} (${sourceUrl})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const webp = await sharp(buffer)
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();

  const key = `objects/${obj.id}.webp`;
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: webp,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  console.log(`Uploaded ${key}`);
  obj.imageKey = `${obj.id}.webp`;
  return true;
}

async function main() {
  let ok = 0;
  let fail = 0;
  for (const obj of objects) {
    try {
      const uploaded = await fetchAndUpload(obj);
      if (uploaded) {
        ok++;
        await sleep(1200);
      }
    } catch (e) {
      fail++;
      console.error(`Error for ${obj.id}:`, e);
    }
  }
  writeFileSync(objectsPath, JSON.stringify(objects, null, 2) + "\n");
  console.log(`Done. ${ok} uploaded, ${fail} failed. objects.json updated for successes.`);
}

main();

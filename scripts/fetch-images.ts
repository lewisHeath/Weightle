/**
 * Downloads object images, resizes to WebP, uploads to Cloudflare R2.
 *
 * Requires: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 *
 * Usage: npx tsx scripts/fetch-images.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

interface ObjectEntry {
  id: string;
  imageKey: string;
}

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME ?? "weightle-images";

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error(
    "Missing R2 env vars. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY",
  );
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

const objects: ObjectEntry[] = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/objects.json"), "utf-8"),
);

async function fetchAndUpload(obj: ObjectEntry) {
  if (!obj.imageKey.startsWith("http")) {
    console.log(`Skip ${obj.id}: imageKey is not a URL (already on R2?)`);
    return;
  }

  const res = await fetch(obj.imageKey);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${obj.id}: ${res.status}`);
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
}

async function main() {
  for (const obj of objects) {
    try {
      await fetchAndUpload(obj);
    } catch (e) {
      console.error(`Error for ${obj.id}:`, e);
    }
  }
  console.log("Done. Update objects.json imageKey to {id}.webp for R2 URLs.");
}

main();

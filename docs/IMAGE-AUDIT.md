# Image loading audit

## How images work

1. `objects.json` stores `imageKey` (either `{id}.webp` or a full URL).
2. `getImageUrl()` in `src/lib/data.ts` builds the final URL:
   - `imageKey` starting with `http` → used as-is
   - otherwise → `https://cdn.weightle.app/objects/{imageKey}`
3. `ObjectImage` shows a letter placeholder if the URL fails to load.

## What was broken (May 2026)

**108 of 1,134 objects** did not load. All **1,024 CDN `.webp` files were fine** (HTTP 200).

| Issue | Count | Cause |
|-------|------:|-------|
| Wikipedia **page** URL | 105 | `imageKey` was `https://en.wikipedia.org/wiki/...` (HTML, not an image) |
| Video / bad source | 3 | `.webm` / `.ogv` or corrupt JPEG on Wikimedia |

The bulk catalog merge stored a **fallback wiki link** when Wikipedia had no lead image in the API. The upload step skipped those objects, so the site tried to render encyclopedia pages as `<img src>`.

## Tools

```bash
npm run audit-images    # HEAD-check CDN + flag invalid imageKeys → scripts/output/image-audit.json
npm run repair-images   # Commons search + manual overrides for bad keys
npx tsx scripts/fetch-images.ts   # Upload new/changed sources to R2
```

`validate-dataset` now **fails** if any object uses a Wikipedia page URL or video extension.

## Prevention

- Run `npm run audit-images` after catalog changes.
- Only commit `imageKey` values that are `{id}.webp` (after R2 upload) or direct `upload.wikimedia.org` image URLs.
- Do not store `en.wikipedia.org/wiki/...` in `imageKey`.

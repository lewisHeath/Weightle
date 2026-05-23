# Weightle

A daily guessing game — compare two objects and pick the heavier one. Five rounds per game.

- **Daily Weightle** — same puzzle worldwide, resets at midnight UTC
- **Unlimited Weightle** — random pairs every game

## Stack

- Next.js 15, TypeScript, Tailwind, shadcn-style UI
- Curated object dataset (`src/data/objects.json`)
- Images: Wikimedia Commons (dev) → Cloudflare R2 (`cdn.weightle.app`) in production
- Hosting: GCP Cloud Run behind Cloudflare DNS

## Local development

### If `npm run dev` crashes with `libicui18n.70.dylib`

Your Homebrew Node 18 is outdated and linked against a missing ICU library. **Fix (no compiler needed):**

```bash
bash scripts/setup-local-node.sh
export PATH="$(pwd)/.tools/node-v22.16.0/bin:$PATH"
npm run dev
```

Add the `export PATH=...` line to `~/.zshrc` so it persists. Or use `bash scripts/dev.sh` after setup.

**Alternative fixes:**

- Update Xcode Command Line Tools (`sudo rm -rf /Library/Developer/CommandLineTools && sudo xcode-select --install`), then `brew reinstall node`
- Install [fnm](https://github.com/Schniz/fnm): `curl -fsSL https://fnm.vercel.app/install | bash` → `fnm install` → `fnm use`

### Normal setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run validate-dataset   # CI check for objects + pairs
npm run generate-pairs     # Regenerate pairs.json from objects
npx tsx scripts/fetch-images.ts   # Upload images to R2 (needs R2 env vars)
```

## Deployment

**Full step-by-step checklist:** [DEPLOYMENT.md](./DEPLOYMENT.md)

Summary:

1. Push to GitHub (`main` branch)
2. GCP Cloud Run + Artifact Registry + GitHub secrets
3. Cloudflare R2 + `cdn.weightle.app` + upload images
4. Cloudflare DNS → proxied CNAME `weightle.app` → Cloud Run, SSL **Full (strict)**

## Data

Each object includes a canonical `massKg`, human-readable `qualifier`, and `sourceUrl`. Pairs require at least 20% weight difference. Edit `src/data/objects.json` then run `npm run generate-pairs`.

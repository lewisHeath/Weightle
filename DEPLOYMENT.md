# Weightle — production deployment checklist

Follow these in order. Estimated time: 1–2 hours if you already have GCP and Cloudflare accounts.

**First time on Google Cloud?** Use the detailed walkthrough: [docs/GCP-FIRST-TIME-SETUP.md](docs/GCP-FIRST-TIME-SETUP.md)

**Blocked on keys or Workload Identity?** Use Cloud Build instead: [docs/GCP-CLOUD-BUILD-DEPLOY.md](docs/GCP-CLOUD-BUILD-DEPLOY.md)

---

## Phase 1 — GitHub

### 1. Initialize and push

```bash
cd /Users/lewisheath/Weightle
git init
git add .
git commit -m "Initial Weightle app"
```

Create a **private or public** repo on GitHub (empty, no README). Then:

```bash
git branch -M main
git remote add origin git@github.com:YOUR_USER/weightle.git
git push -u origin main
```

### 2. GitHub Actions secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | What it is |
|--------|------------|
| `GCP_PROJECT_ID` | Your GCP project ID (e.g. `weightle-prod`) |
| `WORKLOAD_IDENTITY_PROVIDER` | Workload Identity provider resource name (see [docs/GCP-WORKLOAD-IDENTITY.md](docs/GCP-WORKLOAD-IDENTITY.md)) |
| `GCP_SERVICE_ACCOUNT` | `github-deploy@weightle-prod.iam.gserviceaccount.com` |

If Google blocks JSON key creation, use Workload Identity — do **not** disable the security policy.

Optional (for uploading images from your machine or a separate workflow later):

| Secret | What it is |
|--------|------------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | `weightle-images` |

Pushes to `main` run `.github/workflows/deploy.yml` (validate dataset → build → deploy Cloud Run).

---

## Phase 2 — Google Cloud (Cloud Run)

### 1. Create project and enable APIs

```bash
gcloud projects create weightle-prod --name="Weightle"
gcloud config set project weightle-prod

gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com
```

### 2. Artifact Registry (Docker images)

```bash
gcloud artifacts repositories create weightle \
  --repository-format=docker \
  --location=europe-west2 \
  --description="Weightle app images"
```

### 3. Service account for GitHub Actions

```bash
gcloud iam service-accounts create github-deploy \
  --display-name="GitHub Actions deploy"

gcloud projects add-iam-policy-binding weightle-prod \
  --member="serviceAccount:github-deploy@weightle-prod.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding weightle-prod \
  --member="serviceAccount:github-deploy@weightle-prod.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding weightle-prod \
  --member="serviceAccount:github-deploy@weightle-prod.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud iam service-accounts keys create gcp-sa-key.json \
  --iam-account=github-deploy@weightle-prod.iam.gserviceaccount.com
```

Copy the contents of `gcp-sa-key.json` into GitHub secret `GCP_SA_KEY`, then **delete the local file**.

### 4. First deploy

Push to `main` or run the workflow manually. Note the Cloud Run URL:

```bash
gcloud run services describe weightle --region=europe-west2 --format='value(status.url)'
```

Example: `https://weightle-xxxxx-ew.a.run.app`

---

## Phase 3 — Cloudflare R2 (images)

### 1. Create bucket

Cloudflare dashboard → **R2** → Create bucket → `weightle-images`

### 2. Custom domain

Bucket → **Settings** → **Custom Domains** → Add `cdn.weightle.app`  
(Cloudflare will add the DNS record if the zone is on your account.)

### 3. R2 API token

**R2 → Manage R2 API Tokens** → Create token with read/write on `weightle-images`.

### 4. Upload images

On your Mac (with Node working):

```bash
export R2_ACCOUNT_ID="..."
export R2_ACCESS_KEY_ID="..."
export R2_SECRET_ACCESS_KEY="..."
export R2_BUCKET_NAME="weightle-images"
npx tsx scripts/fetch-images.ts
```

Then update each entry in `src/data/objects.json`: set `"imageKey": "{id}.webp"` (e.g. `"apple.webp"`) instead of Wikimedia URLs. Commit and push.

---

## Phase 4 — Cloudflare DNS (weightle.app)

### 1. App domain

**DNS** → Add record:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `@` | Your Cloud Run hostname (from step 2.4) | Proxied (orange) |
| CNAME | `www` | `weightle.app` | Proxied |

### 2. SSL

**SSL/TLS** → Overview → **Full (strict)**

**SSL/TLS** → Edge Certificates → enable **Always Use HTTPS**

### 3. Custom domain on Cloud Run (Option A — region limited)

**Domain mappings are NOT available in `europe-west2` (London).** If Google shows that error, skip this and use **Cloudflare Worker** below or redeploy to **`europe-west1`** (Belgium).

If your service is in a supported region: ☰ → **Cloud Run** → **Domain mappings** → [Add mapping](https://console.cloud.google.com/run/domains).

### 3b. Cloudflare Worker proxy (works in europe-west2 — use this)

Cloudflare cannot set `Host` via Transform Rules. Use a Worker instead:

1. Cloudflare → **Workers & Pages** → **Create Worker** → name `weightle-proxy`
2. Paste the script from [docs/CLOUDFLARE-WORKER-PROXY.md](docs/CLOUDFLARE-WORKER-PROXY.md)
3. **Deploy** → **Settings** → **Triggers** → add routes `weightle.app/*` and `www.weightle.app/*`
4. Keep DNS proxied (orange cloud), SSL **Full (strict)**

Test https://weightle.app

### 4. Cache (recommended)

**Caching** → Cache Rules:

- **Bypass** cache for HTML: URI Path does not start with `/_next/static`
- Or: Cache Everything for `/_next/static/*` with long TTL

### 5. Verify

- https://weightle.app loads
- https://cdn.weightle.app/objects/apple.webp loads (after R2 upload)
- Daily + Unlimited games work; images show

---

## Phase 5 — Post-launch (product)

These are planned refinements, not blockers for v1:

1. **More objects** — grow `objects.json` toward ~100+ hand-curated items
2. **Harder pairs** — raise `MIN_WEIGHT_RATIO` in `src/lib/pairs.ts` or add difficulty tiers
3. **Image pipeline in CI** — optional workflow to run `fetch-images.ts` on data changes
4. **Analytics** — Cloudflare Web Analytics or Plausible (privacy-friendly)
5. **Custom domain on Cloud Run** — optional if using Transform Rule Host header fix above

---

## Quick reference

| What | URL / command |
|------|----------------|
| Local dev | `npm run dev:local` or PATH to `.tools/node-v22.16.0/bin` |
| Production URL | https://weightle.app |
| Image CDN | https://cdn.weightle.app/objects/{id}.webp |
| Validate data | `npm run validate-dataset` |
| Regenerate pairs | `npm run generate-pairs` |

---

## Troubleshooting

**Google 404 on weightle.app but run.app URL works**  
Cloudflare cannot set the `Host` header via Transform Rules. Use **Cloud Run custom domain mapping** (Phase 4 step 3) or a **Cloudflare Worker** ([docs/CLOUDFLARE-WORKER-PROXY.md](docs/CLOUDFLARE-WORKER-PROXY.md)).

**GitHub Action fails on Docker push**  
Ensure Artifact Registry repo `weightle` exists in `europe-west2` and SA has `artifactregistry.writer`.

**502 / SSL errors on weightle.app**  
Set Cloudflare SSL to **Full (strict)**; Cloud Run must be reached over HTTPS.

**Images 404**  
R2 custom domain not connected, or `imageKey` in JSON still points to Wikimedia instead of `{id}.webp`.

**Build works locally but not in CI**  
CI uses Node from `ubuntu-latest` — no local `.tools/node` needed.

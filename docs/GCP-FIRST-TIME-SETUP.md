# First-time Google Cloud setup for Weightle

Your GitHub repo: **https://github.com/lewisHeath/Weightle**  
Your GCP project: **weightle-prod**

You do **not** need to click “Create service” on the Cloud Run page. GitHub Actions builds the app and creates/updates Cloud Run for you.

---

## Part A — Confirm your project ID

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. At the top, click the project dropdown and select **weightle-prod**
3. Click the **gear** next to the project name → **Project settings**
4. Copy the **Project ID** (not “Project name”). It should be `weightle-prod`.

You will use this exact string everywhere as `weightle-prod`.

---

## Part B — Enable required APIs (web console)

1. Stay in project **weightle-prod**
2. Open the menu (☰) → **APIs & services** → **Library**
3. Search and enable each of these (click → **Enable**):
   - **Cloud Run Admin API**
   - **Artifact Registry API**
   - **Identity and Access Management (IAM) API**
   - **Cloud Build API** (optional but harmless)

Wait until each says “API enabled”.

---

## Part C — Create Artifact Registry (where Docker images are stored)

1. Menu ☰ → **Artifact Registry** → **Repositories**
2. Click **+ Create repository**
3. Fill in:
   - **Name:** `weightle` (must match the workflow — lowercase)
   - **Format:** Docker
   - **Mode:** Standard
   - **Location type:** Region
   - **Region:** `europe-west2` (London — matches deploy workflow)
4. Click **Create**

You will not upload images manually. GitHub Actions pushes them here on each deploy.

---

## Part D — Create a service account for GitHub

This account is only for deploying from GitHub — not for your personal login.

1. Menu ☰ → **IAM & Admin** → **Service accounts**
2. Click **+ Create service account**
3. **Service account name:** `github-deploy`
4. **Service account ID:** `github-deploy` (auto-filled)
5. Click **Create and continue**
6. **Grant roles** — click **Add another role** and add these **three** roles:
   - **Cloud Run Admin**
   - **Artifact Registry Writer**
   - **Service Account User**
7. Click **Continue** → **Done**

---

## Part E — Connect GitHub (no JSON key)

If **Create key** shows *“Service account key creation is disabled”* — that is normal. **Do not** disable the org policy.

Follow the dedicated guide instead (Workload Identity Federation):

**→ [GCP-WORKLOAD-IDENTITY.md](./GCP-WORKLOAD-IDENTITY.md)**

**Common mistake:** use **Workload** Identity Federation (GitHub / OIDC), **not** **Workforce** Identity Federation (Okta / Ping / Keycloak).

Summary: link GitHub → `github-deploy` service account without downloading a key.

---

## Part F — Add GitHub secrets

1. Open **https://github.com/lewisHeath/Weightle/settings/secrets/actions**
2. Add these **three** secrets:

| Name | Value |
|------|--------|
| `GCP_PROJECT_ID` | `weightle-prod` |
| `WORKLOAD_IDENTITY_PROVIDER` | From Workload Identity Federation (see linked guide) |
| `GCP_SERVICE_ACCOUNT` | `github-deploy@weightle-prod.iam.gserviceaccount.com` |

Do **not** use `GCP_SA_KEY` — the workflow does not need it.

Do **not** add R2 secrets yet unless you are uploading images — those are optional for later.

---

## Part G — Run the deploy workflow

1. Open **https://github.com/lewisHeath/Weightle/actions**
2. Click **Deploy to Cloud Run** in the left sidebar
3. If you see a failed run from before secrets existed, that’s normal
4. Click **Run workflow** (dropdown on the right) → branch **main** → **Run workflow**

   If you don’t see “Run workflow”, push any small change to `main` instead:

   ```bash
   cd /Users/lewisheath/Weightle
   git commit --allow-empty -m "Trigger Cloud Run deploy"
   git push
   ```

5. Click the new workflow run and watch the steps:
   - Validate dataset ✓
   - Build ✓
   - Auth ✓
   - Build and push image ✓
   - Deploy to Cloud Run ✓

First deploy often takes **5–10 minutes** (Docker build).

### If something fails

| Step | Common fix |
|------|------------|
| Auth | `GCP_SA_KEY` JSON incomplete or wrong project |
| Docker push | Artifact Registry repo `weightle` missing in `europe-west2` |
| Deploy | Service account missing **Cloud Run Admin** or **Service Account User** |

Open the failed step’s log and search for `ERROR`.

---

## Part H — Find your live Cloud Run URL

After a green workflow:

### Option 1 — Cloud Console

1. Menu ☰ → **Cloud Run**
2. Click service **weightle**
3. Copy the URL at the top (e.g. `https://weightle-xxxxx-ew.a.run.app`)

### Option 2 — Terminal (if you install gcloud later)

```bash
gcloud run services describe weightle \
  --project=weightle-prod \
  --region=europe-west2 \
  --format='value(status.url)'
```

Open that URL in a browser — you should see Weightle.

---

## Part I — Connect weightle.app (Cloudflare)

Do this **after** Part H works on the `*.run.app` URL.

1. Cloudflare → **DNS** for `weightle.app`
2. Add record:
   - **Type:** CNAME
   - **Name:** `@`
   - **Target:** your Cloud Run hostname only (e.g. `weightle-xxxxx-ew.a.run.app`) — no `https://`
   - **Proxy:** Proxied (orange cloud)
3. **SSL/TLS** → **Full (strict)**
4. Wait a few minutes, then open https://weightle.app

---

## What you should ignore on the Cloud Run “Create service” screen

If Cloud Run shows **“Create service”** with container image, CPU, memory, etc. — **skip that** for now. That flow is for manual deploys. Your repo already defines:

- Dockerfile
- GitHub Action that builds and deploys on every push to `main`

After the first successful Action run, **weightle** will appear in the Cloud Run list automatically.

---

## Checklist

- [ ] Project **weightle-prod** selected in console
- [ ] APIs enabled (Cloud Run, Artifact Registry, IAM)
- [ ] Artifact Registry repo **weightle** in **europe-west2**
- [ ] Service account **github-deploy** with 3 roles
- [ ] JSON key downloaded
- [ ] GitHub secrets `GCP_PROJECT_ID` and `GCP_SA_KEY` set
- [ ] GitHub Action completed successfully
- [ ] Site loads on `*.run.app` URL
- [ ] Cloudflare CNAME → Cloud Run (when ready)

---

## Next after Cloud Run works

1. **R2 images** — see [DEPLOYMENT.md](../DEPLOYMENT.md) Phase 3
2. **More game content** — expand `src/data/objects.json`

# Deploy Weightle with Cloud Build (solo / org-blocked accounts)

Use this if:

- Service account **keys** are blocked
- **Workload Identity Federation** console says “not viewable for organizations”
- You are one person and Google still shows `heathlewis766-org` or similar

Cloud Build runs **inside Google Cloud** when you push to GitHub. No JSON keys, no Workload Identity setup in the console.

---

## Why Google says “organization”

When you sign up for Google Cloud, Google often creates:

- A **project** (`weightle-prod`) — where your app runs
- An **organization** (`heathlewis766-org`) — a wrapper for billing/policy, even for solo developers

You are not a company; Google still uses “organization” as an account type. Some IAM screens only work at project level or via **gcloud**, not in the org UI.

---

## Part 1 — Prerequisites (you likely did these)

In project **weightle-prod**:

- [ ] Artifact Registry repo **`weightle`**, region **`europe-west2`**, format **Docker**
- [ ] Service account **`github-deploy`** is optional for this path (Cloud Build uses its own account)
- [ ] APIs enabled: **Cloud Build**, **Cloud Run**, **Artifact Registry**

---

## Part 2 — Allow Cloud Build to deploy

1. ☰ → **Cloud Build** → **Settings**
2. Open **Service account permissions** (or **View service account**)
3. Note the Cloud Build service account email, usually:

   `PROJECT_NUMBER@cloudbuild.gserviceaccount.com`

4. ☰ → **IAM & Admin** → **IAM**
5. Find that Cloud Build service account → **Edit** (pencil) → **Add another role**:
   - **Cloud Run Admin**
   - **Service Account User**
6. It should already have **Artifact Registry Writer** after first build; if not, add it.

---

## Part 3 — Connect GitHub to Cloud Build

1. ☰ → **Cloud Build** → **Repositories** (or **Repositories** under 2nd gen)
2. Click **Create host connection** or **Connect repository**
3. Choose **GitHub**
4. Sign in and authorize Google Cloud Build
5. Select repository: **`lewisHeath/Weightle`**
6. Finish linking

---

## Part 4 — Create a trigger

1. ☰ → **Cloud Build** → **Triggers** → **Create trigger**
2. Suggested settings:

   | Field | Value |
   |-------|--------|
   | Name | `deploy-weightle-main` |
   | Region | `global` or `europe-west2` (either works) |
   | Event | Push to a branch |
   | Repository | `lewisHeath/Weightle` (connected in Part 3) |
   | Branch | `^main$` |
   | Configuration | Cloud Build configuration file |
   | Location | Repository |
   | File | `cloudbuild.yaml` |

3. **Create**

---

## Part 5 — Run the first deploy

**Option A:** Push to `main`:

```bash
git add cloudbuild.yaml docs/
git commit -m "Add Cloud Build deploy"
git push
```

**Option B:** On the trigger page → **Run trigger** → branch `main`

1. ☰ → **Cloud Build** → **History** — watch the build (about 5–10 min first time)
2. When green: ☰ → **Cloud Run** → service **weightle** → copy URL

---

## Part 6 — Cloudflare DNS

Same as before: CNAME `weightle.app` → your `*.run.app` hostname, SSL **Full (strict)**.

---

## GitHub Actions vs Cloud Build

| | GitHub Actions | Cloud Build (this guide) |
|--|----------------|---------------------------|
| Runs on | GitHub | Google Cloud |
| GCP auth | Workload Identity or keys | Built-in (no secrets) |
| Config file | `.github/workflows/deploy.yml` | `cloudbuild.yaml` |

You can **disable** or ignore the GitHub Actions deploy workflow if you only use Cloud Build.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on `docker push` | Artifact Registry repo `weightle` in `europe-west2` |
| Deploy permission denied | Cloud Build SA needs Cloud Run Admin + Service Account User |
| Trigger does not run | Branch is `main`; file is `cloudbuild.yaml` at repo root |
| npm build fails | Check build logs in Cloud Build history |

---

## Optional: try Workload Identity via terminal

If you install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) on your Mac, project-level commands sometimes work when the console does not:

```bash
gcloud config set project weightle-prod
```

See [GCP-WORKLOAD-IDENTITY.md](./GCP-WORKLOAD-IDENTITY.md) — run the `gcloud iam workload-identity-pools ...` commands from a terminal instead of the console.

For most solo devs blocked in the UI, **Cloud Build (this doc) is the easier path.**

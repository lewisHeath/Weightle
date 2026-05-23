# Step 5 (alternative) — Connect GitHub without JSON keys

Your Google account blocks **service account key** creation (`iam.disableServiceAccountKeyCreation`). That is intentional security policy — you should **not** try to disable it.

Use **Workload Identity Federation** instead: GitHub proves its identity to Google, and Google lets it use your `github-deploy` service account — no password file needed.

You already completed:
- Service account `github-deploy` with Cloud Run Admin, Artifact Registry Writer, Service Account User

Skip the **Keys** tab entirely.

---

## Part E1 — Enable one more API

1. ☰ → **APIs & services** → **Library**
2. Search **IAM Service Account Credentials API** → **Enable**
3. Search **Security Token Service API** → **Enable** (if listed)

---

## ⚠️ Workforce vs Workload (read this first)

Google has **two similar menus** in IAM & Admin:

| Menu item | Purpose | Providers you see |
|-----------|---------|-------------------|
| **Workforce Identity Federation** ❌ | Log in *employees* via Okta, Ping, etc. | Okta, Ping, Keycloak… |
| **Workload Identity Federation** ✅ | CI/CD like **GitHub Actions** | OpenID Connect (OIDC) |

You want **Workload** (for machines/CI), not **Workforce** (for humans).

If you already created `github-pool-lewisheath` under **Workforce**, you can ignore or delete it — we will create a new pool under **Workload**.

### Console says “not viewable for organizations”

Google attached an **organization** to your account (e.g. `heathlewis766-org`) even if you are solo. The Workload Identity **console UI** is sometimes hidden for those accounts.

**Easier option:** deploy with **[GCP-CLOUD-BUILD-DEPLOY.md](./GCP-CLOUD-BUILD-DEPLOY.md)** (connect GitHub in Cloud Build — no keys, no Workload Identity UI).

**Or** run the `gcloud` commands in Part E2b below from a terminal — they often work at **project** level when the console does not.

---

## Part E2 — Create Workload Identity Pool

1. ☰ → **IAM & Admin** → **Workload Identity Federation**  
   (scroll the left sidebar — it is **above** “Workforce Identity Federation”)
2. Confirm the page title says **Workload Identity Federation**, not Workforce
3. Click **Get started** or **+ Create pool**
3. **Pool name:** `GitHub Actions`
4. **Pool ID:** `github-pool` (type exactly — lowercase, hyphen)
5. Click **Continue**

---

## Part E3 — Add GitHub as a provider

1. **Select a provider** → **OpenID Connect (OIDC)**
2. Click **Continue**
3. Fill in:
   - **Provider name:** `GitHub`
   - **Provider ID:** `github-provider`
   - **Issuer (URL):** `https://token.actions.githubusercontent.com`
4. **Audiences:** leave default (`https://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider` or similar — default is fine)
5. **Attribute mapping** — use these four lines (edit if the UI shows a form):

   | Google attribute | OIDC claim |
   |------------------|------------|
   | `google.subject` | `assertion.sub` |
   | `attribute.actor` | `assertion.actor` |
   | `attribute.repository` | `assertion.repository` |
   | `attribute.repository_owner` | `assertion.repository_owner` |

   Some consoles offer a **“GitHub Actions”** preset — use that if available.

6. **Attribute conditions** (recommended — only your repo can deploy):

   ```
   assertion.repository=='lewisHeath/Weightle'
   ```

7. Click **Save** / **Continue**

---

## Part E4 — Connect the service account

Still in the pool/provider wizard, or on the provider details page:

1. Look for **Grant access** / **Connected service accounts** / **Principal access**
2. Choose service account: **github-deploy@weightle-prod.iam.gserviceaccount.com**
3. Role: **Workload Identity User** (`roles/iam.workloadIdentityUser`)

If the wizard ended without this step:

1. Go to **IAM & Admin** → **Service accounts**
2. Open **github-deploy@weightle-prod.iam.gserviceaccount.com**
3. Tab **Permissions** or use **Grant access**
4. **New principal** — paste this (replace `PROJECT_NUMBER`):

   ```
   principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/lewisHeath/Weightle
   ```

   **How to find PROJECT_NUMBER:**
   - ☰ → **IAM & Admin** → **Settings** — copy **Project number** (digits only, e.g. `123456789012`)

5. **Role:** **Workload Identity User**
6. Save

---

## Part E5 — Copy values for GitHub secrets

### 1. Provider resource name (`WORKLOAD_IDENTITY_PROVIDER`)

On **Workload Identity Federation** → pool **github-pool** → provider **github-provider**:

- Click the provider name
- Find **Provider resource name** (full path). It looks like:

  ```
  projects/123456789012/locations/global/workloadIdentityPools/github-pool/providers/github-provider
  ```

Copy the whole string.

### 2. Service account email (`GCP_SERVICE_ACCOUNT`)

```
github-deploy@weightle-prod.iam.gserviceaccount.com
```

---

## Part F (updated) — GitHub secrets

Open: **https://github.com/lewisHeath/Weightle/settings/secrets/actions**

Create **three** secrets (delete `GCP_SA_KEY` if you already added one — it is not used anymore):

| Secret name | Value |
|-------------|--------|
| `GCP_PROJECT_ID` | `weightle-prod` |
| `WORKLOAD_IDENTITY_PROVIDER` | Full provider resource name from E5 |
| `GCP_SERVICE_ACCOUNT` | `github-deploy@weightle-prod.iam.gserviceaccount.com` |

---

## Part G — Push updated workflow and deploy

The repo workflow must use Workload Identity (not JSON keys). Pull latest or push:

```bash
cd /Users/lewisheath/Weightle
git pull
git push
```

Then: **Actions** → **Deploy to Cloud Run** → **Run workflow**

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `invalid_target` / provider not found | `WORKLOAD_IDENTITY_PROVIDER` typo — copy full path from console |
| `Permission denied` on deploy | Service account missing Cloud Run Admin / Artifact Registry Writer |
| `denied: Permission "artifactregistry.repositories.uploadArtifacts"` | Artifact Registry Writer on `github-deploy` |
| `workload identity user` | Re-do Part E4 principal binding for `lewisHeath/Weightle` |
| `id-token` permission | Workflow must have `permissions: id-token: write` (already in repo) |

---

## Why this is better than JSON keys

- No key file to leak
- Only your GitHub repo can impersonate the service account
- Matches Google’s “secure by default” policy — you did the right thing hitting that popup

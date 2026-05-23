# Cloudflare Worker proxy for Cloud Run (fallback)

Use this only if **Cloud Run custom domain mapping** is unavailable. Cloudflare Transform Rules **cannot** set the `Host` header.

## Setup

1. Cloudflare → **Workers & Pages** → **Create** → **Create Worker**
2. Name: `weightle-proxy`
3. Replace the script with:

```javascript
const ORIGIN = "weightle-147195182226.europe-west2.run.app";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = ORIGIN;
    url.protocol = "https:";

    const headers = new Headers(request.headers);
    headers.set("Host", ORIGIN);

    return fetch(
      new Request(url.toString(), {
        method: request.method,
        headers,
        body: request.body,
        redirect: "manual",
      }),
    );
  },
};
```

4. **Deploy**
5. **Workers & Pages** → your worker → **Settings** → **Triggers** → **Add route**:
   - `weightle.app/*`
   - `www.weightle.app/*`

6. Delete or disable the broken Transform Rule if you created one.

7. Test https://weightle.app

## Notes

- Free Workers plan: 100,000 requests/day (plenty for launch)
- Update `ORIGIN` if your Cloud Run URL changes
- Prefer **Cloud Run custom domain mapping** when possible — no Worker in the path

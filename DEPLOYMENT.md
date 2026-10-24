# Cloudflare deployment

One Cloudflare Worker serves the web app as static assets and runs the Rust API on `/api/*`.
Upstash remains the snippet store, while image downloads are rendered in the browser.

## First deployment

1. Install dependencies and authenticate Wrangler:

   ```bash
   npm install
   npx wrangler login
   ```

2. Keep `APP_URL` set to the existing `code-frame` Worker URL. Download links open its
   `/download/:id` route.

3. Add the Upstash credentials as Worker secrets:

   ```bash
   npx wrangler secret put UPSTASH_REDIS_REST_URL
   npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
   ```

4. Build and deploy the combined frontend and API to the existing `code-frame` Worker:

   ```bash
   npm run deploy:cloudflare
   ```

## Automatic deployments

Connect the GitHub repository to the existing `code-frame` Worker and use:

- Production branch: `main`
- Build command: `npm install && cargo install --locked worker-build@^0.8`
- Deploy command: `npm run deploy:cloudflare`

Add both Upstash values as secrets on the `code-frame` Worker. Remove the old `VITE_API_URL`
build variable if present; the frontend now calls `/api` on its own origin.

## Local Cloudflare test

Add the two Upstash values to `.dev.vars`, then run:

```bash
npm run dev:cloudflare
```

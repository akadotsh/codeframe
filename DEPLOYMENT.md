# Cloudflare deployment

Cloudflare Pages serves the existing web app. A separate Cloudflare Worker runs only the Rust API.
Upstash remains the snippet store, while image downloads are rendered in the browser.

## First deployment

1. Install dependencies and authenticate Wrangler:

   ```bash
   npm install
   npx wrangler login
   ```

2. Replace `APP_URL` in `wrangler.jsonc` with the existing Cloudflare Pages URL. Download links
   open the `/download/:id` route on that web app.

3. Add the Upstash credentials as Worker secrets:

   ```bash
   npx wrangler secret put UPSTASH_REDIS_REST_URL
   npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
   ```

4. Deploy:

   ```bash
   npm run deploy:api
   ```

## Automatic deployments

Connect the GitHub repository to a separate Worker and use:

- Production branch: `main`
- Build command: `cargo install --locked worker-build@^0.8`
- Deploy command: `npx wrangler deploy`

Add both Upstash values under the Worker build/deployment secrets. This deployment does not build
or upload the web app.

## Connect the Pages app

Set this build variable on the existing Pages project, then redeploy the Pages app once:

```text
VITE_API_URL=https://code-frame-api.<your-subdomain>.workers.dev
```

Use the URL printed by Wrangler after the API deployment.

## Local Cloudflare test

Add the two Upstash values to `.dev.vars`, then run:

```bash
npm run dev:api
```

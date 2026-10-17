# Cloudflare deployment

Cloudflare serves the web build as Worker static assets and forwards `/api/*` to the Rust API in a
Container. Upstash remains the snippet store, while image downloads are rendered in the browser.

## First deployment

1. Install dependencies and authenticate Wrangler:

   ```bash
   npm install
   npx wrangler login
   ```

2. Replace `APP_URL` in `wrangler.jsonc` with the final Worker or custom-domain URL.

3. Add the Upstash credentials as Worker secrets:

   ```bash
   npx wrangler secret put UPSTASH_REDIS_REST_URL
   npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
   ```

4. Deploy:

   ```bash
   npm run deploy:cloudflare
   ```

The first container request can take a few minutes while Cloudflare provisions the image.

## Automatic deployments

Connect the GitHub repository under **Workers & Pages → Create application** and use:

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Add both Upstash values under the Worker build/deployment secrets. Each push to `main` will then
build and deploy the web app, Worker, and API container.

## Local Cloudflare test

Docker must be running. Add the two Upstash values to `.dev.vars`, then run:

```bash
npm run dev:cloudflare
```

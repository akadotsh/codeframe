# Cloudflare deployment

Cloudflare serves the web build as static assets and runs the Rust API as a WebAssembly Worker.
Upstash remains the snippet store, while image downloads are rendered in the browser.

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

## Automatic deployments

Connect the GitHub repository under **Workers & Pages → Create application** and use:

- Production branch: `main`
- Build command: `npm run build && cargo install --locked worker-build@^0.8 && npm run build:api`
- Deploy command: `npx wrangler deploy`

Add both Upstash values under the Worker build/deployment secrets. Each push to `main` will then
build and deploy the web app and Rust Worker.

## Local Cloudflare test

Add the two Upstash values to `.dev.vars`, then run:

```bash
npm run dev:cloudflare
```

# Cloudflare deployment

One Cloudflare Worker serves the web app as static assets and runs the Rust API on `/api/*`.
Upstash remains the snippet store, while image downloads are rendered in the browser.

## First deployment

1. Install dependencies and authenticate Wrangler:

   ```bash
   npm install
   npx wrangler login
   ```

2. Add the Upstash credentials as Worker secrets:

   ```bash
   npx wrangler secret put UPSTASH_REDIS_REST_URL
   npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
   ```

3. Build and deploy the combined frontend and API to the existing `code-frame` Worker:

   ```bash
   npm run deploy:cloudflare
   ```

## Automatic deployments

Connect the GitHub repository to the existing `code-frame` Worker and use:

- Production branch: `main`
- Build command: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && . "$HOME/.cargo/env" && rustup target add wasm32-unknown-unknown && cargo install --locked worker-build@^0.8 && npm run build:cloudflare`
- Deploy command: `npx wrangler deploy`

The build command installs Rust because Workers Builds provides Node but not Cargo, then builds
the frontend and Rust Worker explicitly. Workers Builds does not run the `[build]` section from
`wrangler.jsonc`. Add both Upstash values as secrets on the `code-frame` Worker. Download links
use the incoming request's origin, and the frontend calls `/api` on that same origin. Remove any
old `APP_URL` or `VITE_API_URL` variables if present.

## Local Cloudflare test

Add the two Upstash values to `.dev.vars`, then run:

```bash
npm run dev:cloudflare
```

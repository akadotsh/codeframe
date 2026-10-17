# Code Frame

A focused web app and API for turning code snippets into polished images and shareable links.

## Tech stack

- React, TanStack Router, Shiki, and Canvas for the editor and image renderer
- Rust, Axum, and Tokio for the API
- Upstash Redis as the key-value store for shareable snippet state
- Headless Chrome for server-side PNG, WebP, and JPEG rendering
- npm workspaces for the monorepo

## Architecture

```text
packages/
├── api/    # Axum API, Upstash persistence, and headless image rendering
└── web/    # React editor, shared-link loader, and Canvas renderer
```

The web app can export an image directly in the browser. For a share link, it sends the snippet
configuration to `POST /api/snippets`; the API validates it and stores the JSON in Upstash with a
90-day expiry. The returned short URL loads the state through `GET /api/snippets/{id}`.

`POST /api/images` accepts the same snippet configuration. The API opens the web app's `/render`
route in headless Chrome, reuses the browser renderer, and returns the image bytes directly. Images
are generated on demand and are not stored in Upstash.

```text
Share link: Web app -> Rust API -> Upstash -> /s/{id}
Image API:  Client  -> Rust API -> /render -> PNG, WebP, or JPEG
```

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env`, add the Upstash REST credentials, and run the API separately:

```bash
npm run dev:api
```

The web app must be running at `RENDER_PAGE_URL` for server-side image rendering. Locally, the
defaults are `http://localhost:5173/render` and `http://localhost:8080` for the API.

The API exposes:

- `GET /health` to check availability
- `POST /api/snippets` to create a code-frame snippet
- `GET /api/snippets/{id}` to retrieve a created snippet
- `POST /api/images` to return a rendered PNG, WebP, or JPEG

Create a short share link:

```bash
curl --fail --show-error http://localhost:8080/api/snippets \
  --header 'content-type: application/json' \
  --data '{"code":"fn main() {}","language":"Rust","title":"main.rs"}'
```

Render an image (`imageFormat` defaults to `png`):

```bash
curl --fail --show-error http://localhost:8080/api/images \
  --header 'content-type: application/json' \
  --data '{"code":"fn main() {\n    println!(\"Hello!\");\n}","language":"Rust","title":"main.rs","imageFormat":"png"}' \
  --output code-frame.png
```

Useful checks:

```bash
npm run typecheck
npm run build
npm run check
```

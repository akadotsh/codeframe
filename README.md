# Code Frame

A focused TanStack Router app for turning code snippets into polished PNG images.

## Architecture

Code Frame uses npm workspaces for the browser application and a small Rust API built with Axum.

```text
packages/
├── api/    # Rust API
└── web/    # React web app
```

## Development

```bash
npm install
npm run dev
```

Run the API separately at `http://localhost:8080`:

```bash
npm run dev:api
```

The API exposes:

- `GET /health` to check availability
- `POST /api/snippets` to create a code-frame snippet
- `GET /api/snippets/{id}` to retrieve a created snippet

For example:

```bash
curl http://localhost:8080/api/snippets \
  --header 'content-type: application/json' \
  --data '{"code":"fn main() {}","language":"Rust","title":"main.rs"}'
```

Useful checks:

```bash
npm run typecheck
npm run build
npm run check
```

Code and image exports currently stay entirely in the browser; the API is ready for server-side
features as they are added.

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

Its initial health check is available at `GET /health`.

Useful checks:

```bash
npm run typecheck
npm run build
npm run check
```

Code and image exports currently stay entirely in the browser; the API is ready for server-side
features as they are added.

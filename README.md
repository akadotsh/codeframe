# Code Frame

A focused TanStack Router app for turning code snippets into polished PNG images.

## Architecture

Code Frame uses npm workspaces. The browser application lives in `packages/web`; future API
and MCP packages can be added alongside it when needed.

```text
packages/
└── web/    # TanStack Router application
```

## Development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run build
```

Code and exports stay entirely in the browser.

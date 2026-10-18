# Code Frame

An app for creating beautiful screenshots and shareable images from code snippets and terminal
output.

## Tech stack

`React` · `TanStack Router` · `Rust` · `Cloudflare Workers` · `Upstash Redis`

## Development

```bash
npm install
cp .env.example .dev.vars
npm run dev:api
```

## API

- `POST /api/snippets` stores a snippet and returns its `download_url`.
- `GET /api/snippets/{id}` retrieves a shared snippet.

Create a download URL:

```bash
curl --fail --show-error http://localhost:8787/api/snippets \
  --header 'content-type: application/json' \
  --data '{"code":"fn main() {}","language":"Rust","title":"main.rs","imageFormat":"png"}'
```

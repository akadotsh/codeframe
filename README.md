# Code Frame

An app for creating beautiful screenshots and shareable images from code snippets and terminal
output.

## Tech stack

`React` · `TanStack Router` · `Rust` · `Axum` · `Upstash Redis`

## Development

```bash
npm install
cp .env.example .env
npm run dev
```

Run the API in a separate terminal:

```bash
npm run dev:api
```

## API

- `POST /api/snippets` creates a short share link backed by Upstash Redis.
- `GET /api/snippets/{id}` retrieves a shared snippet.
- `POST /api/images` returns a PNG, WebP, or JPEG image.

Create an image:

```bash
curl --fail --show-error http://localhost:8080/api/images \
  --header 'content-type: application/json' \
  --data '{"code":"fn main() {}","language":"Rust","title":"main.rs","imageFormat":"png"}' \
  --output code-frame.png
```

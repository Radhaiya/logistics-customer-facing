# Customer Facing Logistics App

Vite React TypeScript app for the customer-facing logistics UI.

## Local Development

```sh
npm install
npm run dev
```

The dev server runs on port `3000`. API requests are sent to `/api/...` and proxied to `http://localhost:8080` by default. Override the backend origin with `VITE_API_PROXY_TARGET` when needed:

```sh
VITE_API_PROXY_TARGET=http://localhost:8081 npm run dev
```

Do not include `/api` in `VITE_API_PROXY_TARGET`; the app already sends `/api/...` paths.

## Production Build

```sh
npm run build
npm run preview
```

The preview server also runs on port `3000`.

## Docker

Build and run the production image with Nginx:

```sh
docker build -t customer-facing .
docker run --rm -p 3000:3000 -e BACKEND_URL=http://host.docker.internal:8080 customer-facing
```

Or use compose:

```sh
docker compose up --build
```

The container serves the app on port `3000`. Nginx proxies `/api/...` to `BACKEND_URL` without adding another `/api`, so set `BACKEND_URL` to the backend origin only, for example `http://backend:8080`, not `http://backend:8080/api`.

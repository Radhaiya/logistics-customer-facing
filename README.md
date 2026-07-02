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

Environment templates are provided for each mode:

```sh
.env.example
.env.development.example
.env.test.example
.env.production.example
```

Use `VITE_API_URL` only when the browser should call a backend origin directly. Leave it empty to use same-origin `/api/...` requests through the dev or Nginx proxy.

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
docker run --rm -p 3000:3000 -e BACKEND_URL=http://production-logisticsapi-1ywacc:8080 customer-facing
```

The container serves the app on port `3000`. Nginx proxies `/api/...` to `BACKEND_URL` without adding another `/api`, so set `BACKEND_URL` to the backend origin only, for example `http://production-logisticsapi-1ywacc:8080`, not `http://production-logisticsapi-1ywacc:8080/api`.

For Docker builds, use `VITE_APP_ENV` and `VITE_API_URL` build args only when overriding the production defaults:

```sh
docker build \
  --build-arg VITE_APP_ENV=production \
  --build-arg VITE_API_URL= \
  -t customer-facing .
```

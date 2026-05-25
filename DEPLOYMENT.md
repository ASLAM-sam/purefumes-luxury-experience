# Purefumes Hyderabad Enterprise Deployment

## Final topology

- Storefront: `https://purefumeshyderabad.in`
- Admin UI: `https://purefumeshyderabad.in/admin`
- API: `https://api.purefumeshyderabad.in`
- MongoDB: MongoDB Atlas replica set
- Redis: shared Redis for locks, queues, rate limiting, replay absorption, and hot cache
- Process manager: PM2 cluster for API, single worker process for BullMQ workers

## Backend runtime

- `backend/server.js`: stateless API entrypoint
- `backend/worker.js`: BullMQ worker entrypoint
- `backend/ecosystem.config.cjs`: PM2 cluster for API plus dedicated worker
- `backend/src/`: new production runtime for auth, cookies, locks, metrics, monitoring, queues, and middleware ordering

## Authentication model

- Access token: JWT in `HttpOnly` cookie, `15m`
- Refresh token: rotating JWT in `HttpOnly` cookie, `7d`
- Refresh tokens are hashed in MongoDB
- Refresh rotation is replay-aware
- Device id is sent from frontend in `X-Device-Id`
- Duplicate refresh calls are absorbed through a short-lived replay cache
- No `express-session`
- No `csurf`
- No browser token storage for auth secrets

## Required production environment

Backend:

```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://purefumeshyderabad.in
BACKEND_URL=https://api.purefumeshyderabad.in
CORS_ORIGIN=https://purefumeshyderabad.in,https://www.purefumeshyderabad.in
COOKIE_DOMAIN=.purefumeshyderabad.in
JWT_SECRET=replace-with-strong-random-secret
REFRESH_SECRET=replace-with-strong-random-secret
COOKIE_SECRET=replace-with-strong-random-secret
MONGO_URI=mongodb+srv://...
REDIS_URL=rediss://...
ADMIN_EMAIL=admin@purefumeshyderabad.in
ADMIN_PASSWORD_HASH=$2b$...
ENFORCE_HTTPS=true
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.05
```

Frontend:

```env
VITE_FRONTEND_URL=https://purefumeshyderabad.in
VITE_API_URL=https://api.purefumeshyderabad.in/api
VITE_SENTRY_DSN=
VITE_SENTRY_TRACES_SAMPLE_RATE=0.05
```

## Cloudflare

- SSL mode: `Full (strict)`
- Cache storefront static assets aggressively
- Bypass cache for `https://api.purefumeshyderabad.in/api/*`
- Enable bot protection / DDoS protection
- Proxy both storefront and API through Cloudflare
- Forward original visitor IP headers to Nginx and Node

## Nginx

- Use the updated config in `frontend/deploy/nginx.conf`
- Terminate TLS at Nginx
- Proxy API traffic to local PM2-managed Node instances
- Enable gzip, keepalive, buffering, and request throttling

## PM2

- Start API with cluster mode: `pm2 start ecosystem.config.cjs --env production`
- API process count: `max`
- Worker process count: `1`
- Use rolling reloads: `pm2 reload purefumes-api`

## MongoDB

- Use Atlas replica set or sharded cluster as traffic grows
- Keep indexes enabled for:
  - `email`
  - `username`
  - `mobile`
  - `role`
  - `refreshTokens.tokenHash`
  - `refreshTokens.sessionId`
  - `refreshTokens.deviceId`
- Use connection pooling and pool caps already configured in `backend/config/db.js`

## Redis

- Shared Redis is strongly recommended in production
- Used for:
  - refresh locking
  - replay absorption
  - rate limiting
  - request deduplication primitives
  - BullMQ
  - auth user cache

## Operational checks

- `GET /api/health`: readiness snapshot, returns `503` when MongoDB/Redis are degraded
- `GET /api/metrics`: Prometheus-style text metrics
- API logs: `backend/logs/combined.log`, `backend/logs/error.log`
- Queue/process health: PM2 dashboard plus Redis monitoring

## Rollout order

1. Provision Redis and MongoDB Atlas.
2. Deploy backend and worker with PM2.
3. Put Nginx in front of Node and validate `api.purefumeshyderabad.in`.
4. Update frontend env to point at the API subdomain.
5. Enable Cloudflare Full Strict SSL and cache rules.
6. Run smoke tests for login, refresh rotation, admin auth, uploads, and order placement.

## Notes

- `npm run build` in `frontend` currently fails in this sandbox because Vite/esbuild cannot resolve the sandboxed config path, but TypeScript validation passes.
- `GET /api/health` returns `503` until MongoDB and Redis are actually connected, which is the intended readiness behavior.

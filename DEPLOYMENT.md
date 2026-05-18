# Purefumes Hyderabad Production Notes

## Architecture

The backend now uses a layered Express architecture:

- `routes` expose versionable HTTP boundaries under `/api`.
- `controllers` keep request/response logic small.
- `services` hold business rules for auth, cart merge, orders, analytics, and email.
- `repositories` isolate database access.
- `middlewares` centralize auth, RBAC, validation, rate limiting, CSRF, logging, and security headers.
- `queues` and `jobs` process email work through BullMQ when `REDIS_URL` is set, with an inline fallback for development.

## Required Production Environment

Set every value in `backend/.env.production` or `backend/.env.example` on Render, Railway, Hostinger Node.js, cPanel Node.js hosting, PM2, AWS EC2, DigitalOcean, or your container runtime. Use long random values for `JWT_SECRET`, `REFRESH_SECRET`, and `COOKIE_SECRET`.

For cross-domain deployments such as Cloudflare Workers frontend plus Render backend:

- Use HTTPS on both origins.
- Set `FRONTEND_URL=https://purefumeshyderabad.in`.
- Set `BACKEND_URL=https://hydpurefumes.onrender.com`.
- Set `CORS_ORIGIN=https://purefumeshyderabad.in,https://www.purefumeshyderabad.in,https://tanstack-start-app.hydpurefumes.workers.dev`.
- Set `GOOGLE_CALLBACK_URL=https://hydpurefumes.onrender.com/auth/google/callback`.
- Set `COOKIE_SAME_SITE=none`.
- Keep `NODE_ENV=production` so cookies are marked `Secure`.
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` for the admin bootstrap user. `ADMIN_USER` and `ADMIN_PASS` are supported only as temporary migration keys.

Frontend production env:

```env
VITE_API_URL=https://hydpurefumes.onrender.com/api
VITE_FRONTEND_URL=https://purefumeshyderabad.in
```

Frontend hosting files included in the repo:

- `frontend/vercel.json` for Vercel SPA rewrites
- `frontend/netlify.toml` and `frontend/public/_redirects` for Netlify SPA rewrites
- `frontend/public/.htaccess` for Apache, Hostinger, GoDaddy, and cPanel static hosting
- `frontend/deploy/nginx.conf` for Nginx reverse-proxy plus SPA fallback

When deploying the frontend from this monorepo, set the site base/root directory to `frontend` on Vercel or Netlify so those config files are picked up directly.
Publish the static browser bundle from `frontend/dist/client`.

Backend hosting files included in the repo:

- `backend/ecosystem.config.cjs` for PM2 process management

## Local Development Notes

- Keep `NODE_ENV=development` in `backend/.env.development`.
- Set `BYPASS_PAYMENT=true` only for local development when you need to complete checkout without Razorpay signature verification.
- Do not enable `BYPASS_PAYMENT` in production.
- Keep `FRONTEND_URL`, `BACKEND_URL`, and `GOOGLE_CALLBACK_URL` aligned with the current environment so OAuth, reset links, cookies, and Brevo emails resolve correctly.

## Nginx Reverse Proxy

For EC2/DigitalOcean, terminate HTTPS at Nginx and proxy to Node:

```nginx
server {
  listen 443 ssl http2;
  server_name api.purefumes.example;

  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }
}
```

## Scaling

Run multiple API instances behind a load balancer. MongoDB stores user sessions as hashed refresh tokens, so instances remain stateless for access tokens. Redis is only required for durable queue processing and can be shared by all instances.

The short-lived OAuth handshake session currently uses `express-session`. For multi-instance production, move that store to Redis or another shared session backend so Google login remains consistent during horizontal scaling.

## Security Checklist

- Never commit `.env`.
- Enforce HTTPS.
- Rotate secrets before launch.
- Configure SMTP provider credentials with Brevo, SendGrid SMTP, AWS SES, or Mailtrap.
- Use MongoDB Atlas IP/network controls.
- Keep admin credentials separate from customer auth.
- Monitor `backend/logs/error.log` or ship Winston logs to your platform logging system.

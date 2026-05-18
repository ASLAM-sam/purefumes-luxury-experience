# Purefumes Hyderabad

The project is split into two apps:

```text
.
|-- frontend/  # Vite + TanStack React app
`-- backend/   # Express + MongoDB API
```

## Run the frontend

```bash
npm install --prefix frontend
npm run frontend:dev
```

The frontend dev server is configured for `http://localhost:8080`.

## Run the backend

```bash
npm install --prefix backend
npm run backend:dev
```

The backend listens on `process.env.PORT || 5000`.

## Environment files

Use the mode-specific env files and keep source code unchanged between local and production deployments.

Backend:

```env
backend/.env.development
backend/.env.production
```

Frontend:

```env
frontend/.env.development
frontend/.env.production
```

Development defaults:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:8080
BACKEND_URL=http://localhost:5000
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```

Production defaults:

```env
VITE_API_URL=https://hydpurefumes.onrender.com/api
VITE_FRONTEND_URL=https://purefumeshyderabad.in
FRONTEND_URL=https://purefumeshyderabad.in
BACKEND_URL=https://hydpurefumes.onrender.com
CORS_ORIGIN=https://purefumeshyderabad.in,https://www.purefumeshyderabad.in,https://tanstack-start-app.hydpurefumes.workers.dev
GOOGLE_CALLBACK_URL=https://hydpurefumes.onrender.com/auth/google/callback
```

The backend auto-loads `.env`, `.env.development`, and `.env.production` based on `NODE_ENV`. The frontend reads the matching Vite env file automatically, and the API/auth URLs adapt from those values without manual code changes.

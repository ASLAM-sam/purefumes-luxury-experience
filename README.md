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

## Run the backend

```bash
npm install --prefix backend
cp backend/.env.example backend/.env
npm run backend:dev
```

## Connect both apps

Create `frontend/.env` and point it at the API:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The frontend can still run without this value because it falls back to mock data.

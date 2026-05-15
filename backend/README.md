# Purefumes Hyderabad Backend

Production Express + MongoDB API for authentication, carts, checkout, orders, admin, analytics, and email workflows.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Required Environment

Use `backend/.env.example` as the source of truth. The backend expects env-driven values for:

- MongoDB connection
- JWT access and refresh secrets
- cookie signing
- frontend/backend URLs
- Google OAuth credentials
- SMTP credentials
- Redis queue connection
- admin bootstrap credentials
- Razorpay keys

## Architecture

- `routes`: HTTP endpoints
- `controllers`: request/response handling
- `services`: auth, cart, order, analytics, email business logic
- `repositories`: MongoDB access helpers
- `middlewares`: auth, RBAC, validation, rate limits, CSRF, logging, security
- `queues` and `jobs`: BullMQ-backed async email delivery

## Core Flows

- Cookie-based JWT auth with refresh rotation
- Google OAuth via Passport
- user-specific MongoDB cart with guest-cart merge
- authenticated checkout and order creation
- password reset + email verification email flows
- role-gated admin APIs under `/api/admin/*`

## Testing

```bash
npm test
```

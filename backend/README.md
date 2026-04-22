# Purefumes Hyderabad Backend

Production Express API backed by MongoDB Atlas. Products, categories, and orders are read from and written to MongoDB only. There is no seeded mock data or static JSON catalog.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
CLOUDINARY_URL=optional
```

Admin endpoints are protected with JWT when the admin variables are configured:

```env
JWT_SECRET=replace-with-a-long-random-string
ADMIN_USER=admin
ADMIN_PASS=change-this-password
CORS_ORIGIN=http://localhost:5173
```

## API

All successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

### Products

- `GET /api/products?page=1&limit=12&category=Designer&brand=Dior&minPrice=500&maxPrice=5000&search=bleu`
- `GET /api/products/:id`
- `GET /api/products/low-stock`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

`POST` and `PUT` accept JSON bodies or `multipart/form-data` with up to 8 image files in the `images` field.

### Orders

- `POST /api/orders` guest checkout, no auth
- `GET /api/orders`
- `PUT /api/orders/:id`

Order placement validates stock inside a MongoDB transaction and reduces product stock before the order is committed.

### Categories

- `GET /api/categories`
- `POST /api/categories`
- `DELETE /api/categories/:id`

## Production Features

- Helmet security headers
- CORS allowlist via `CORS_ORIGIN`
- 100 requests per 15 minutes per IP
- gzip compression
- Morgan request logging
- express-validator request validation
- NoSQL input sanitization
- MongoDB indexes for product search, category, brand, price, stock, and order dashboards
- Optional Cloudinary upload support via `CLOUDINARY_URL`

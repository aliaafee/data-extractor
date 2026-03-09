# data-extractor API

A simple REST API built with **Express.js**, **Prisma ORM**, and **SQLite**.

## Getting Started

### 1. Install dependencies

```bash
npm install
cd client
npm install
cd ..
```

### 2. Setup .env

```bash
DATABASE_URL="file:./dev.db"
PORT=3000
SECRET_KEY="your_secret_key_here"
JWT_EXPIRATION="7d"
```

### 3. Run the database migration

```bash
npm run db:migrate
```

### 4. Start the server

```bash
# Run API + frontend dev server together
npm run dev:all

# Or separately:
npm run dev          # API on http://localhost:3000
npm run dev:client   # React SPA on http://localhost:5173
```

The Vite dev server proxies all `/api` requests to the Express backend, so no CORS config is needed during development.

## API Endpoints

### Auth (public)

| Method | Path                 | Description                       |
| ------ | -------------------- | --------------------------------- |
| POST   | `/api/auth/register` | Register — returns `token`        |
| POST   | `/api/auth/login`    | Login — returns `token`           |
| GET    | `/api/auth/me`       | Get current user (requires token) |

### Items (protected — `Authorization: Bearer <token>` required)

| Method | Path             | Description                     |
| ------ | ---------------- | ------------------------------- |
| GET    | `/health`        | Health check                    |
| GET    | `/api/items`     | List authenticated user's items |
| GET    | `/api/items/:id` | Get item by ID                  |
| POST   | `/api/items`     | Create a new item               |
| PATCH  | `/api/items/:id` | Update an item                  |
| DELETE | `/api/items/:id` | Delete an item                  |

### Example — Register then create an item

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret123"}'

# 2. Use the returned token
TOKEN="<token from above>"

# 3. Create an item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"My first item","description":"Hello, World!"}'
```

## Prisma Commands

| Command               | Description              |
| --------------------- | ------------------------ |
| `npm run db:migrate`  | Apply migrations         |
| `npm run db:generate` | Regenerate Prisma Client |
| `npm run db:studio`   | Open Prisma Studio (GUI) |

<p align="center">
  <a href="https://github.com/"><img src="assets/logo.svg" width="120" alt="DevPomo logo" /></a>
</p>

<h1 align="center">DevPomo — Backend</h1>

<p align="center">
  <a href="#tech-stack"><img src="https://img.shields.io/badge/NestJS-12-E0234E?logo=nestjs&logoColor=white" alt="NestJS" /></a>
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

RESTful API for **DevPomo**, a Pomodoro-style task manager for developers. Built with **NestJS** and **Prisma ORM** on **PostgreSQL**, designed to be consumed by the DevPomo Next.js frontend.

## Features

- **Full CRUD for tasks** — create, list, retrieve, update, and delete
- **Automatic validation** — every request body is validated; unknown properties are rejected (`whitelist` + `forbidNonWhitelisted`)
- **Clean error semantics** — `404 Not Found` for missing tasks, `400 Bad Request` for invalid payloads
- **Typed responses** — handlers return Prisma-generated `Task` types
- **Persistent dev database** — PostgreSQL 17 running in Docker with a named volume

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Framework | [NestJS 12](https://nestjs.com)   |
| ORM       | [Prisma 7](https://www.prisma.io) |
| Database  | PostgreSQL 17 (Docker)            |
| Language  | TypeScript                        |
| Testing   | Jest (unit + e2e)                 |

## Project Structure

```
src/
├── app.module.ts            # Root module (Config, Prisma, Tasks)
├── main.ts                  # Bootstrap: global prefix, validation pipe
├── prisma/
│   ├── prisma.module.ts     # Global Prisma module
│   └── prisma.service.ts    # PrismaClient wrapper (driver adapter + env URL)
├── tasks/
│   ├── tasks.controller.ts  # REST endpoints
│   ├── tasks.service.ts     # Business logic (Prisma queries)
│   ├── dto/                 # create-task.dto.ts, update-task.dto.ts
│   └── entities/            # Task entity types
└── generated/prisma/        # Prisma Client output (gitignored, do not edit)
prisma/
├── schema.prisma            # Database schema
├── migrations/              # SQL migrations
└── seed.ts                  # Idempotent seed with example tasks
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for the PostgreSQL database)
- Yarn or npm

### 1. Install dependencies

```bash
yarn install
# or
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DB_PASSWORD=your-db-password
DB_NAME=DEVPOMO
DATABASE_URL="postgresql://postgres:your-db-password@localhost:5434/DEVPOMO?schema=public"
```

> **Note:** the API connects to Postgres on port **5434** (the Docker container is mapped as `5434:5432` to avoid conflicts with a locally installed PostgreSQL service on 5432).

### 3. Start the database

```bash
docker compose up -d
```

This starts a PostgreSQL 17 container named `DevPomo` on port `5434` with a persistent volume (`postgres`).

### 4. Apply migrations

```bash
npx prisma migrate dev
```

### 5. (Optional) Seed example data

```bash
npx tsx prisma/seed.ts
```

The seed is **idempotent** — it can be run repeatedly without creating duplicates (it upserts by the unique `title`).

### 6. Run the app

```bash
# development (watch mode)
yarn start:dev

# production
yarn build
yarn start:prod
```

## API Reference

Base URL: `http://localhost:3000/api`

| Method | Endpoint      | Description           | Success |
| ------ | ------------- | --------------------- | ------- |
| `POST` | `/api/tasks`  | Create a new task     | `201`   |
| `GET`  | `/api/tasks`  | List all tasks (newest first) | `200` |
| `GET`  | `/api/tasks/:id` | Retrieve one task  | `200` / `404` |
| `PATCH`| `/api/tasks/:id` | Update a task      | `200` / `404` |
| `DELETE`| `/api/tasks/:id` | Delete a task      | `200` / `404` |

### Create a task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Implement CRUD","description":"Tasks module","status":"IN_PROGRESS"}'
```

Request body:

| Field         | Type   | Required | Notes                                              |
| ------------- | ------ | -------- | -------------------------------------------------- |
| `title`       | string | ✅       | Must be unique                                     |
| `description` | string | ❌       |                                                    |
| `status`      | string | ❌       | `IN_PROGRESS` (default) or `COMPLETED`             |

### Response format

```json
{
  "id": 4,
  "title": "Design the Pomodoro timer UI",
  "description": "Create the Next.js + Shadcn timer screen",
  "status": "IN_PROGRESS",
  "createdAt": "2026-11-19T20:49:39.418Z",
  "updatedAt": "2026-11-19T20:49:39.418Z"
}
```

> `status` is always returned as `IN_PROGRESS` / `COMPLETED`. In the database these values are stored as `"In Progress"` / `"Completed"` via Prisma's `@map` — that mapping is internal to the persistence layer.

## Data Model

```prisma
enum TaskStatus {
  IN_PROGRESS @map("In Progress")
  COMPLETED   @map("Completed")
}

model Task {
  id          Int        @id @default(autoincrement())
  title       String     @unique
  description String?
  status      TaskStatus @default(IN_PROGRESS)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

`createdAt` and `updatedAt` are managed automatically by Prisma — never send them in requests.

## Database Schema Changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <change-description>`
3. Prisma regenerates the client into `src/generated/prisma/` automatically

## Testing

```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# coverage
yarn test:cov
```

## Known Limitations / Roadmap

- No authentication yet — tasks are not user-scoped
- Duplicate `title` on create/update surfaces as a `500` (Prisma `P2002`); a `409 Conflict` handler is planned
- CORS is not enabled yet — will be required before the Next.js frontend calls this API
- Pomodoro timer and focus-session tracking are not yet modeled

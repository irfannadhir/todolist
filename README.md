# Daily Todo Tracker Dashboard

Aplikasi todolist harian dengan dashboard sidebar kiri, autentikasi JWT, dan manajemen user.

## Fitur

- Login JWT (`/login`)
- Dashboard dengan sidebar kiri (`/dashboard`)
- CRUD task + status workflow: `pending`, `on_progress`, `hold`, `done`
- Kalender bulanan untuk visualisasi task harian
- CRUD user (email + password)
- Bootstrap user pertama dari halaman login (hanya jika database masih kosong)

## Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- React Hook Form + Zod
- TanStack Query
- Prisma 7 + `@prisma/adapter-pg`
- PostgreSQL
- `jose` (JWT) + `bcryptjs` (hash password)

## Setup

1. Install dependency

```bash
npm install
```

2. Siapkan environment

```bash
cp .env.example .env
```

3. Jalankan migrasi database

```bash
npm run db:migrate
```

4. Jalankan aplikasi

```bash
npm run dev
```

5. Buka `http://localhost:3000/login`

- Jika user belum ada, isi email/password lalu klik **Buat User Pertama**
- Setelah itu login biasa dengan email/password yang sama

## Endpoint API

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/bootstrap`
- `GET/POST /api/tasks`
- `GET/PATCH/DELETE /api/tasks/:id`
- `GET/POST /api/users`
- `GET/PATCH/DELETE /api/users/:id`

## Scripts

- `npm run dev`
- `npm run lint`
- `npm run build -- --webpack`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:studio`

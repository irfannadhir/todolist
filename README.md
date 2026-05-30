# Daily Todo Tracker Dashboard

Aplikasi todolist harian dengan dashboard sidebar kiri, autentikasi JWT, dan manajemen user.

## Fitur

- Login JWT (`/login`)
- Dashboard dengan sidebar kiri (`/dashboard`)
- CRUD task + status workflow: `pending`, `on_progress`, `hold`, `done`
- Kalender bulanan untuk visualisasi task harian
- CRUD user (email + password)
- Bootstrap user pertama dari halaman login (hanya jika database masih kosong)
- Cron scheduler pengingat task via Resend API (tanpa SMTP)

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

## Cron Reminder Email (Resend + cron-job.org)

Tambahkan konfigurasi berikut di `.env`:

- `CRON_SECRET` (wajib di production)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TASK_REMINDER_TIMEZONE` (default: `Asia/Jakarta`)
- `TASK_REMINDER_DRY_RUN` (`true/false`)

Perilaku:

- Scheduler akan mencari task user yang jatuh tempo hari ini (UTC date) dengan status `PENDING`, `ON_PROGRESS`, atau `HOLD`.
- Email hanya dikirim untuk task dengan `dueTime` yang sama persis dengan waktu saat endpoint dipanggil (format `HH:mm` pada timezone `TASK_REMINDER_TIMEZONE`).
- Email pengingat dikirim per user ke email akun masing-masing.
- Pengiriman memakai Resend Node SDK (`resend.emails.send`) dengan React template di `components/email-template.mjs`.
- Endpoint cron: `GET /api/cron/task-reminder`.
- Trigger cron dijalankan oleh external scheduler (misalnya `cron-job.org`), bukan Vercel Cron.
- Endpoint memverifikasi secret dari:
  - Header `Authorization: Bearer <CRON_SECRET>`, atau
  - Query param `?secret=<CRON_SECRET>`.

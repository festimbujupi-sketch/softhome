# Soft Home – online shop

Next.js 15 shop with a built-in admin panel (CMS) at `/admin`. Everything is in Albanian, with prices in €, cash-on-delivery and WhatsApp orders.

## Run locally

```bash
npm install
npm run db:push   # create/update the database tables (local.db)
npm run seed      # first time only: optimise the photos from ../ and load the starter catalogue
npm run dev       # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

The admin password is `ADMIN_PASSWORD` in `.env.local` (see `.env.example` for all settings).

## How it fits together

| Part | Where |
| --- | --- |
| Shop pages | `src/app/(shop)` – home, `/kategoria/[slug]`, `/produkti/[slug]`, `/porosia` (checkout) |
| Admin (CMS) | `src/app/admin` – products, photos, variants & stock, categories, orders, settings |
| Database schema | `src/db/schema.ts` (Drizzle ORM, SQLite locally / Turso in production) |
| Order placement | `src/app/actions/order.ts` – checks stock, saves the order, decrements stock |
| Photo uploads | `src/lib/storage.ts` – `public/uploads` locally, Vercel Blob in production |
| Starter catalogue | `scripts/catalog.ts` + `scripts/seed.ts` |

Stock and SKU live on each **variant** (colour/size). The SKU is the key for syncing with the shop's
selling software later.

## Deploying to Vercel (later)

1. Create a Turso database and set `DATABASE_URL` + `DATABASE_AUTH_TOKEN`, then run `npm run db:push` and `npm run seed` against it.
2. Add a Vercel Blob store (sets `BLOB_READ_WRITE_TOKEN`).
3. Set `ADMIN_PASSWORD`, `AUTH_SECRET` and, optionally, `RESEND_API_KEY` for order emails.

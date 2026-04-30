---
name: reset-newsflash-db
description: "Use when resetting, reseeding, wiping, deleting, or refreshing the NewsFlash local development database from Prisma seed data, especially after changing seed.ts video URLs or sample content."
argument-hint: "Optional: why the local DB needs reset/reseed"
---

# Reset NewsFlash DB

## When To Use
- The seed data in `prisma/seed.ts` changed and the local database should match it exactly.
- Sample article video URLs, thumbnails, publishers, comments, or counters were updated.
- Local development data is messy and should be replaced with the canonical seed data.

## Safety
This workflow deletes application data from the database configured by `DATABASE_URL`. Use it only for local/development databases. It preserves Prisma migration history by excluding `_prisma_migrations`.

## Procedure
1. Confirm the terminal is in `server-news-flash`.
2. Confirm `.env` points `DATABASE_URL` to the intended local database.
3. Run:

```powershell
npm run prisma:reset-seed
```

The command truncates all application tables, preserves `_prisma_migrations`, and then runs the seed data from `prisma/seed.ts`.

## Implementation
- Reset script: `prisma/reset-seed.ts`
- Seed source: `prisma/seed.ts`
- Package command: `prisma:reset-seed`

# Fumigaciones Delta

Landing page for Fumigaciones Delta (La Plata) with a content admin panel. Next.js 16 App Router, MySQL (Prisma 7), Better Auth.

## Development

Requires MySQL 8 and these environment variables (in `.env`, never committed):

| Variable             | Value                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`       | `mysql://user:password@host:3306/fumigaciones_delta`                      |
| `BETTER_AUTH_SECRET` | Long random string, different per environment (`openssl rand -base64 48`) |
| `BETTER_AUTH_URL`    | Public URL of the site (`http://localhost:3000` in development)           |
| `UPLOADS_DIR`        | Absolute folder for uploaded media                                        |

```bash
npm install
npm run db:migrate   # applies prisma/migrations to the dev database
npm run admin:create # creates an admin, or resets the password of an existing one
npm run dev          # http://localhost:3000, panel at /admin
npm test             # Vitest
npm run lint         # Biome
npm run typecheck
```

## Structure

- `src/features/content/`: one Zod schema per editable section (`schema.ts`), the original copy as defaults (`defaults.ts`) and the cached read (`queries.ts`, tag `site-content`). A section without a stored row, or whose stored row no longer validates, falls back to its default; if the database is down the site serves the defaults.
- `src/features/admin/`: panel. `section-fields.ts` describes each section's form and one generic editor renders them; `actions.ts` holds the Server Actions (each checks the session and validates again).
- `src/features/media/`: uploads. Images become WebP of at most 2560 px; videos become silent H.264 MP4 of at most 1280×720, 30 fps and 40 s, with a WebP poster. The real type is checked from the file's bytes. Files are stored in `UPLOADS_DIR` with server-generated names and served by `src/app/uploads/[file]/route.ts` (Range support, immutable cache).
- `src/lib/auth.ts`: Better Auth with email and password, sign-up disabled, 5 sign-in attempts per 15 minutes per IP. Admins are created with `npm run admin:create`.
- `src/config/site.ts`: fixed identity (domain, brand, address, coverage polygon). Contact data and copy are edited in the panel.
- `src/features/quote/`: the guided quote chat. It builds the message in the browser and opens WhatsApp.
- `src/styles/legacy/`: the original stylesheets, loaded only by the site's route group `(site)`. The panel uses its own Tailwind sheet (`src/app/admin/admin.css`).
- `scripts/migrate.mjs`: applies pending migrations at container start (see Deploy).

FAQ answers accept a minimal format: a blank line starts a new paragraph and lines starting with `- ` become a list.

## Deploy (Dokploy + Railpack)

`railpack.json` builds Next.js in standalone mode, bundles `scripts/migrate.mjs` into `.next/standalone/migrate.cjs` and copies `prisma/migrations`. At start the container runs the migrations (under a MySQL `GET_LOCK`, compatible with Prisma's `_prisma_migrations`) and then the server with `--max-old-space-size=384`. If a migration fails, the site still starts and the log shows `[migrate] ATENCION`.

In Dokploy:

- Railpack 0.39 or newer, no `NODE_OPTIONS` in Environment, domain port 3000.
- Environment: the four variables above, with `UPLOADS_DIR=/app/uploads` and a MySQL user whose grants cover only this database.
- Advanced → Mounts: bind mount `/srv/uploads/fumigaciones-delta` → `/app/uploads`, included in backups.
- Advanced → Resources: Memory Limit 768 MB (video transcoding runs ffmpeg outside the JS heap).
- First admin: from a development machine with an SSH tunnel to the database, `DATABASE_URL=... npm run admin:create`.

To try the production build locally:

```bash
npm run build
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
npm start
```

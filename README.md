# Fumigaciones Delta

Landing page for Fumigaciones Delta (La Plata). Next.js 16 App Router, statically prerendered, no database.

## Development

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest (quote assistant logic)
npm run lint         # Biome
npm run typecheck
```

## Structure

- `src/config/site.ts`: brand, WhatsApp number, Instagram, phone, Maps link and form examples.
- `src/features/quote/`: the guided quote chat. It builds the message in the browser and opens WhatsApp; nothing is stored or sent to a server.
- `src/components/`: sections (Server Components) and the interactive pieces (header, ambient videos, Leaflet coverage map, section settle on scroll).
- `src/styles/legacy/`: the original stylesheets, loaded in their original order. Tailwind 4 is loaded without Preflight so it does not change their output.
- `public/data/coverage-delta.json`: coverage polygon (La Plata, Berisso, Ensenada).

## Deploy (Dokploy + Railpack)

`railpack.json` builds Next.js in standalone mode and starts `node --max-old-space-size=256 .next/standalone/server.js` with `HOSTNAME=0.0.0.0`. In Dokploy: Railpack 0.39 or newer, no `NODE_OPTIONS` in Environment, Memory Limit 512 MB, domain port 3000.

To try the production build locally:

```bash
npm run build
cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public
npm start
```

import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync(new URL("./mapa-cobertura.svg", import.meta.url), "utf8");
const html = `<!doctype html><meta charset="utf-8"><title>mapa</title>
<style>
  body { margin: 0; background: #111; }
  svg { width: 760px; height: 820px; display: block; }
  .zone-out { fill: #1c3a2e; stroke: #2a5344; stroke-width: 1; }
  .zone-gba { fill: #d8ef83; fill-opacity: .78; stroke: #102818; stroke-width: 1.2; stroke-linejoin: round; }
  .zone-caba { fill: #f4ffc4; stroke: #102818; stroke-width: 1.3; stroke-linejoin: round; }
  .zone-glow { fill: #d8ef83; opacity: .4; }
  .map-labels text { font: 650 15px Archivo, sans-serif; fill: #f4ffe8; stroke: #08211c; stroke-width: 4px; paint-order: stroke; text-anchor: middle; }
  .map-city { font: 750 22px Archivo, sans-serif; fill: #102818; text-anchor: middle; }
  .map-river { font: 600 14px Archivo, sans-serif; fill: #9fd0d8; text-anchor: middle; }
</style>
${svg}`;
writeFileSync(new URL("./map-preview.html", import.meta.url), html);

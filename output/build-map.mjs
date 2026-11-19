import { readFileSync, writeFileSync, existsSync } from "node:fs";

const cachePath = new URL("./amba-cache.json", import.meta.url);
const places = [
  ["caba", "Ciudad Autónoma de Buenos Aires, Argentina"],
  ["gba", "Partido de Almirante Brown, Buenos Aires, Argentina"],
  ["gba", "Partido de Avellaneda, Buenos Aires, Argentina"],
  ["gba", "Partido de Berazategui, Buenos Aires, Argentina"],
  ["gba", "Partido de Esteban Echeverría, Buenos Aires, Argentina"],
  ["gba", "Partido de Ezeiza, Buenos Aires, Argentina"],
  ["gba", "Partido de Florencio Varela, Buenos Aires, Argentina"],
  ["gba", "Partido de General San Martín, Buenos Aires, Argentina"],
  ["gba", "Partido de Hurlingham, Buenos Aires, Argentina"],
  ["gba", "Partido de Ituzaingó, Buenos Aires, Argentina"],
  ["gba", "Partido de José C. Paz, Buenos Aires, Argentina"],
  ["gba", "Partido de La Matanza, Buenos Aires, Argentina"],
  ["gba", "Partido de Lanús, Buenos Aires, Argentina"],
  ["gba", "Partido de Lomas de Zamora, Buenos Aires, Argentina"],
  ["gba", "Partido de Malvinas Argentinas, Buenos Aires, Argentina"],
  ["gba", "Partido de Merlo, Buenos Aires, Argentina"],
  ["gba", "Partido de Moreno, Buenos Aires, Argentina"],
  ["gba", "Partido de Morón, Buenos Aires, Argentina"],
  ["gba", "Partido de Quilmes, Buenos Aires, Argentina"],
  ["gba", "Partido de San Fernando, Buenos Aires, Argentina"],
  ["gba", "Partido de San Isidro, Buenos Aires, Argentina"],
  ["gba", "Partido de San Miguel, Buenos Aires, Argentina"],
  ["gba", "Partido de Tigre, Buenos Aires, Argentina"],
  ["gba", "Partido de Tres de Febrero, Buenos Aires, Argentina"],
  ["gba", "Partido de Vicente López, Buenos Aires, Argentina"],
  ["out", "Partido de Pilar, Buenos Aires, Argentina"],
  ["out", "Partido de General Rodríguez, Buenos Aires, Argentina"],
  ["out", "Partido de Marcos Paz, Buenos Aires, Argentina"],
  ["out", "Partido de Presidente Perón, Buenos Aires, Argentina"],
  ["out", "Partido de San Vicente, Buenos Aires, Argentina"],
  ["out", "Partido de Escobar, Buenos Aires, Argentina"]
];

async function fetchPlace(query) {
  const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(query) + "&format=geojson&polygon_geojson=1&polygon_threshold=0.0035&limit=5";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "TrazaCoverageMap/1.0 (local static site map)",
      "Accept-Language": "es"
    }
  });
  if (!response.ok) throw new Error(response.status + " " + query);
  const json = await response.json();
  const feature = (json.features || []).find((item) => item.geometry && /Polygon/.test(item.geometry.type) && /Buenos Aires|CABA|Ciudad Autónoma/i.test(item.properties?.display_name || ""));
  if (!feature) throw new Error("Sin polígono: " + query + " :: " + JSON.stringify(json).slice(0, 240));
  return { name: feature.properties.name, geometry: feature.geometry };
}

let cached = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, "utf8")) : {};
for (const [kind, query] of places) {
  if (cached[query]) continue;
  process.stdout.write("fetch " + query + "\n");
  cached[query] = { kind, ...(await fetchPlace(query)) };
  writeFileSync(cachePath, JSON.stringify(cached));
  await new Promise((resolve) => setTimeout(resolve, 1100));
}

function clipRing(ring, box) {
  const edges = [
    [(p) => p[0] >= box.minLon, (a, b) => interp(a, b, (box.minLon - a[0]) / (b[0] - a[0]))],
    [(p) => p[0] <= box.maxLon, (a, b) => interp(a, b, (box.maxLon - a[0]) / (b[0] - a[0]))],
    [(p) => p[1] >= box.minLat, (a, b) => interp(a, b, (box.minLat - a[1]) / (b[1] - a[1]))],
    [(p) => p[1] <= box.maxLat, (a, b) => interp(a, b, (box.maxLat - a[1]) / (b[1] - a[1]))]
  ];
  let output = ring;
  for (const [inside, edge] of edges) {
    if (output.length < 3) return [];
    const input = output;
    output = [];
    for (let i = 0; i < input.length; i++) {
      const current = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      const cin = inside(current);
      const pin = inside(prev);
      if (cin) {
        if (!pin) output.push(edge(prev, current));
        output.push(current);
      } else if (pin) output.push(edge(prev, current));
    }
  }
  return output;
}
function interp(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
function openRing(ring) {
  if (ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1]) return ring.slice(0, -1);
  return ring;
}
function area(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum / 2);
}
function distanceToSegment(point, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return Math.abs(dy * point[0] - dx * point[1] + b[0] * a[1] - b[1] * a[0]) / len;
}
function simplify(points, epsilon) {
  if (points.length < 3) return points;
  let max = 0;
  let index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const value = distanceToSegment(points[i], points[0], points[end]);
    if (value > max) {
      max = value;
      index = i;
    }
  }
  if (max > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon);
    const right = simplify(points.slice(index), epsilon);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[end]];
}
function polygonsOf(geometry) {
  if (geometry.type === "Polygon") return [geometry.coordinates];
  if (geometry.type === "MultiPolygon") return geometry.coordinates;
  return [];
}

function centroidOf(ring) {
  const lon = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
  const lat = ring.reduce((sum, point) => sum + point[1], 0) / ring.length;
  return [lon, lat];
}

const records = [];
for (const [query, item] of Object.entries(cached)) {
  const polygons = [];
  for (const polygon of polygonsOf(item.geometry)) {
    const rings = polygon.map((ring) => simplify(openRing(ring), 0.0014)).filter((ring) => ring.length >= 4 && area(ring) > 0.0004);
    if (!rings.length) continue;
    const [, lat] = centroidOf(rings[0]);
    const deltaIsland = /San Fernando|Escobar/.test(item.name) && lat > -34.4;
    if (deltaIsland) continue;
    polygons.push(rings);
  }
  records.push({ kind: item.kind, name: item.name, polygons });
  const points = polygons.reduce((sum, polygon) => sum + polygon[0].length, 0);
  console.log(item.kind, item.name, "parts", polygons.length, "pts", points);
}

const cos = Math.cos(-34.6 * Math.PI / 180);
const coveragePoints = records.filter((record) => record.kind !== "out").flatMap((record) => record.polygons.flatMap((polygon) => polygon[0]));
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const [lon, lat] of coveragePoints) {
  const x = lon * cos;
  const y = -lat;
  minX = Math.min(minX, x);
  maxX = Math.max(maxX, x);
  minY = Math.min(minY, y);
  maxY = Math.max(maxY, y);
}
maxX += (maxX - minX) * 0.11;

const width = 760;
const height = 820;
const pad = { l: 46, r: 36, t: 48, b: 36 };
const scale = Math.min((width - pad.l - pad.r) / (maxX - minX), (height - pad.t - pad.b) / (maxY - minY));
const usedW = (maxX - minX) * scale;
const usedH = (maxY - minY) * scale;
const offsetX = pad.l + ((width - pad.l - pad.r) - usedW) / 2;
const offsetY = pad.t + ((height - pad.t - pad.b) - usedH) / 2;
const project = (lon, lat) => [offsetX + (lon * cos - minX) * scale, offsetY + (-lat - minY) * scale];

function pathOf(polygons) {
  return polygons.map((polygon) => polygon.map((ring) => {
    const commands = ring.map(([lon, lat], index) => {
      const [x, y] = project(lon, lat);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return commands.join("") + "Z";
  }).join("")).join("");
}
function centroid(polygons) {
  const ring = polygons[0][0];
  const lon = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
  const lat = ring.reduce((sum, point) => sum + point[1], 0) / ring.length;
  return project(lon, lat);
}

const water = [
  [-58.5, -33.6], [-58.5, -35.7], [-57.3, -35.7], [-57.3, -33.6]
];

const groups = { out: [], gba: [], caba: [] };
const labels = [];
let cabaCenter = [width / 2, height / 2];
for (const record of records) {
  if (!record.polygons.length) continue;
  const placeName = record.kind === "caba" ? "CABA" : record.name.replace("Partido de ", "");
  groups[record.kind].push(`<path d="${pathOf(record.polygons)}"><title>${placeName}</title></path>`);
  const labelNames = new Set(["Tigre", "San Isidro", "Morón", "La Matanza", "Quilmes", "Moreno", "Lomas de Zamora"]);
  const short = record.name.replace("Partido de ", "");
  if (record.kind === "caba") cabaCenter = centroid(record.polygons);
  if (labelNames.has(short)) {
    const nudge = { Moreno: [34, 6], "La Matanza": [8, 10], Tigre: [8, 18], Quilmes: [-6, 6], "San Isidro": [0, 4] };
    const [x, y] = centroid(record.polygons);
    const [dx, dy] = nudge[short] || [0, 0];
    labels.push(`<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}">${short === "Lomas de Zamora" ? "Lomas" : short}</text>`);
  }
}

const waterPath = pathOf([[water]]);
const riverX = 655;
const riverY = 300;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="amba-map" role="img" aria-labelledby="map-title map-desc">
  <title id="map-title">Mapa de cobertura de Traza</title>
  <desc id="map-desc">CABA y los 24 partidos del Gran Buenos Aires resaltados. El río de la Plata queda al este.</desc>
  <rect width="${width}" height="${height}" fill="#08211c"/>
  <path class="map-water" d="${waterPath}" fill="#0c3340"/>
  <g class="zone-out">${groups.out.join("")}</g>
  <g class="zone-glow" filter="url(#map-glow)">${groups.gba.join("")}${groups.caba.join("")}</g>
  <g class="zone-gba">${groups.gba.join("")}</g>
  <g class="zone-caba">${groups.caba.join("")}</g>
  <g class="map-labels">${labels.join("")}</g>
  <text class="map-city" x="${cabaCenter[0].toFixed(1)}" y="${cabaCenter[1].toFixed(1)}">CABA</text>
  <g class="map-north" transform="translate(46 58)" fill="none" stroke="#d7e7cf" stroke-width="1.6" stroke-linecap="round">
    <path d="M8 22V4M8 4 3.5 10M8 4l4.5 6"/>
    <text x="8" y="36" fill="#d7e7cf" stroke="none" font-family="Archivo, Manrope, sans-serif" font-size="13" font-weight="700" text-anchor="middle">N</text>
  </g>
  <text class="map-river" x="${riverX.toFixed(1)}" y="${riverY.toFixed(1)}" transform="rotate(90 ${riverX.toFixed(1)} ${riverY.toFixed(1)})">Río de la Plata</text>
  <defs>
    <filter id="map-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
  </defs>
</svg>`;

writeFileSync(new URL("./mapa-cobertura.svg", import.meta.url), svg);
console.log("svg", svg.length, "caba", cabaCenter.map((n) => n.toFixed(1)).join(","));

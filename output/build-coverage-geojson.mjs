import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const polygonClipping = require(process.env.POLYGON_CLIPPING);

const cache = JSON.parse(readFileSync(new URL("./amba-cache.json", import.meta.url), "utf8"));

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
function roundRing(ring) {
  const rounded = ring.map(([lon, lat]) => [Number(lon.toFixed(5)), Number(lat.toFixed(5))]);
  const unique = rounded.filter((point, index) => {
    const prev = rounded[(index + rounded.length - 1) % rounded.length];
    return point[0] !== prev[0] || point[1] !== prev[1];
  });
  if (unique.length && (unique[0][0] !== unique.at(-1)[0] || unique[0][1] !== unique.at(-1)[1])) unique.push(unique[0]);
  return unique;
}
function centroid(ring) {
  const lon = ring.reduce((sum, point) => sum + point[0], 0) / ring.length;
  const lat = ring.reduce((sum, point) => sum + point[1], 0) / ring.length;
  return [lon, lat];
}

const land = { minLon: -59.2, maxLon: -58.15, minLat: -35.12, maxLat: -34.22 };
const polygons = [];

for (const item of Object.values(cache)) {
  if (item.kind === "out") continue;
  const parts = item.geometry.type === "Polygon" ? [item.geometry.coordinates] : item.geometry.type === "MultiPolygon" ? item.geometry.coordinates : [];
  for (const polygon of parts) {
    const rings = [];
    for (const source of polygon) {
      const opened = openRing(source);
      const [, lat] = centroid(opened);
      if (/San Fernando|Escobar/.test(item.name) && lat > -34.4) continue;
      const clipped = clipRing(opened, land);
      const simple = simplify(clipped, 0.00045).filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));
      if (simple.length < 4 || area(simple) < 0.00035) continue;
      const closed = roundRing(simple);
      if (closed.length >= 4) rings.push(closed);
    }
    if (!rings.length) continue;
    rings.sort((a, b) => area(b) - area(a));
    polygons.push(rings);
    const east = Math.max(...rings[0].map((point) => point[0]));
    const north = Math.max(...rings[0].map((point) => point[1]));
    console.log(item.kind, item.name, "pts", rings[0].length, "east", east.toFixed(3), "north", north.toFixed(3));
  }
}

const union = polygonClipping.union(...polygons).map((polygon) => {
  const [outer, ...holes] = polygon;
  const kept = holes.filter((ring) => area(ring) > 0.001);
  return [outer, ...kept];
});
const feature = {
  type: "Feature",
  properties: { name: "Zona de cobertura" },
  geometry: { type: "MultiPolygon", coordinates: union }
};
const json = JSON.stringify(feature);
writeFileSync(new URL("../js/coverage-zone.json", import.meta.url), json);
console.log("polygons", polygons.length, "parts", union.length, "bytes", json.length);

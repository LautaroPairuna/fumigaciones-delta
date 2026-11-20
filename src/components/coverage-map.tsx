"use client";

import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { LatLngBounds, Map as LeafletMap, Path } from "leaflet";
import { useEffect, useRef } from "react";
import { site } from "@/config/site";

type CoverageData = Feature<Geometry> | FeatureCollection<Geometry>;

const SVG_NS = "http://www.w3.org/2000/svg";

export function CoverageMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Leaflet touches `window` on import, so it loads in the effect, client-side only.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let frameQueued = false;
    let requestFrame = () => {};

    import("leaflet").then(async (L) => {
      if (disposed) return;
      map = L.map(container, {
        zoomControl: false,
        attributionControl: true,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        zoomSnap: 0.05,
        fadeAnimation: false,
        zoomAnimation: false,
      });
      const leafletMap = map;
      leafletMap.attributionControl.setPrefix(false);
      leafletMap.getContainer().removeAttribute("tabindex");
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, OpenStreetMap',
        },
      ).addTo(leafletMap);

      const tone = (name: string, fallback: string) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
      const zoneFill = tone("--zone-fill", "#248a4a");
      const zoneLine = tone("--zone-line", "#0c3320");
      const zoneRim = tone("--zone-rim", "#0e5c34");
      const zoneHalo = tone("--zone-halo", "#ffffff");
      const zoneOpacity = Number(tone("--zone-opacity", "0.2")) || 0.2;

      let zoneLayer: ReturnType<typeof L.geoJSON> | null = null;
      let zoneBounds: LatLngBounds | null = null;

      // Frames only the main polygon cluster so distant fragments don't shrink the zoom.
      const nearbyBounds = (data: CoverageData): LatLngBounds | null => {
        const geometry = "geometry" in data ? data.geometry : null;
        const polygons =
          geometry?.type === "MultiPolygon"
            ? geometry.coordinates
            : geometry?.type === "Polygon"
              ? [geometry.coordinates]
              : [];
        const boxes = polygons
          .map((polygon) => {
            let south = Number.POSITIVE_INFINITY;
            let north = Number.NEGATIVE_INFINITY;
            let west = Number.POSITIVE_INFINITY;
            let east = Number.NEGATIVE_INFINITY;
            for (const [lon = 0, lat = 0] of polygon[0] ?? []) {
              south = Math.min(south, lat);
              north = Math.max(north, lat);
              west = Math.min(west, lon);
              east = Math.max(east, lon);
            }
            return L.latLngBounds([south, west], [north, east]);
          })
          .filter((bounds) => bounds.isValid());
        const first = boxes[0];
        if (!first) return null;
        const span = (bounds: LatLngBounds) =>
          bounds.getSouthWest().distanceTo(bounds.getNorthEast());
        const largest = boxes.reduce((best, bounds) => (span(bounds) > span(best) ? bounds : best));
        const center = largest.getCenter();
        const keep = boxes.filter((bounds) => bounds.getCenter().distanceTo(center) < 80000);
        const [head, ...rest] = keep;
        if (!head) return null;
        return rest.reduce(
          (bounds, box) => bounds.extend(box),
          L.latLngBounds(head.getSouthWest(), head.getNorthEast()),
        );
      };

      const frame = () => {
        leafletMap.invalidateSize({ animate: false, pan: false });
        const size = leafletMap.getSize();
        if (!zoneLayer || size.x < 40 || size.y < 40) return;
        const wide = size.x >= 900;
        leafletMap.fitBounds(zoneBounds ?? zoneLayer.getBounds(), {
          paddingTopLeft: [
            wide ? Math.round(size.x * 0.05) : 18,
            wide ? Math.round(size.y * 0.16) : 28,
          ],
          paddingBottomRight: [
            wide ? Math.round(size.x * 0.035) : 24,
            wide ? Math.round(size.y * 0.07) : 26,
          ],
          animate: false,
        });
      };

      requestFrame = () => {
        if (frameQueued) return;
        frameQueued = true;
        requestAnimationFrame(() => {
          frameQueued = false;
          if (!disposed) frame();
        });
      };

      // Adds an inner rim by clipping a thick stroke of the same shape to itself.
      const dressCoverage = (layer: Path) => {
        const path = layer.getElement() as SVGPathElement | undefined;
        const svg = path?.ownerSVGElement;
        if (!path || !svg || path.dataset.dressed) return;
        path.id = "coverage-shape";
        path.dataset.dressed = "1";
        let defs = svg.querySelector("defs");
        if (!defs) {
          defs = document.createElementNS(SVG_NS, "defs");
          svg.insertBefore(defs, svg.firstChild);
        }
        const clip = document.createElementNS(SVG_NS, "clipPath");
        clip.id = "coverage-clip";
        clip.setAttribute("clipPathUnits", "userSpaceOnUse");
        const clipShape = document.createElementNS(SVG_NS, "use");
        clipShape.setAttribute("href", "#coverage-shape");
        clip.appendChild(clipShape);
        defs.appendChild(clip);
        const rim = document.createElementNS(SVG_NS, "use");
        rim.id = "coverage-rim";
        rim.setAttribute("href", "#coverage-shape");
        rim.setAttribute("clip-path", "url(#coverage-clip)");
        rim.setAttribute("fill", "none");
        rim.setAttribute("stroke", zoneRim);
        rim.setAttribute("stroke-width", "16");
        rim.setAttribute("stroke-opacity", "0.55");
        rim.setAttribute("stroke-linejoin", "round");
        rim.setAttribute("pointer-events", "none");
        path.parentNode?.insertBefore(rim, path);
      };

      try {
        const response = await fetch(site.coverage);
        if (!response.ok) throw new Error(`coverage ${response.status}`);
        const data = (await response.json()) as CoverageData;
        if (disposed) return;
        const quiet = { interactive: false, bubblingMouseEvents: false, smoothFactor: 0.6 };
        L.geoJSON(data, {
          ...quiet,
          style: {
            color: zoneHalo,
            weight: 3.1,
            opacity: 1,
            fill: false,
            lineJoin: "round",
            lineCap: "round",
          },
        }).addTo(leafletMap);
        zoneLayer = L.geoJSON(data, {
          ...quiet,
          style: {
            color: zoneLine,
            weight: 1.85,
            opacity: 1,
            fillColor: zoneFill,
            fillOpacity: zoneOpacity,
            lineJoin: "round",
            lineCap: "round",
          },
          onEachFeature(_feature, layer) {
            layer.on("add", () => dressCoverage(layer as Path));
          },
        }).addTo(leafletMap);
        zoneBounds = nearbyBounds(data);
        requestFrame();
      } catch {
        container.classList.add("is-unavailable");
      }

      resizeObserver = new ResizeObserver(() => requestFrame());
      resizeObserver.observe(container);
    });

    const onResize = () => requestFrame();
    window.addEventListener("resize", onResize);
    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      map?.remove();
    };
  }, []);

  return (
    // biome-ignore lint/a11y/useSemanticElements: fieldset is for form controls; this groups the map and its attribution links
    <div
      ref={containerRef}
      className="coverage-map"
      id="coverage-map"
      role="group"
      aria-label="Mapa de La Plata. La zona de cobertura, La Plata, City Bell, Gonnet y Ensenada, está marcada en rojo."
    >
      <p className="coverage-fallback">La Plata, City Bell, Gonnet y Ensenada.</p>
    </div>
  );
}

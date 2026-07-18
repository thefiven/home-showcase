"use client";

import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  label: string;
}

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};

function metersToPixelsAtZoom(radiusMeters: number, latitude: number, zoom: number): number {
  const earthCircumference = 40075017;
  const metersPerPixel =
    (earthCircumference * Math.cos((latitude * Math.PI) / 180)) / 2 ** (zoom + 8);
  return radiusMeters / metersPerPixel;
}

export function LocationMap({ latitude, longitude, radiusMeters, label }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;

    void import("maplibre-gl").then(({ Map, NavigationControl }) => {
      if (cancelled || !containerRef.current) return;

      map = new Map({
        container: containerRef.current,
        style: OSM_STYLE,
        center: [longitude, latitude],
        zoom: 11,
        maxZoom: 13,
        minZoom: 8,
        attributionControl: { compact: true },
      });
      map.addControl(new NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        if (!map) return;
        const gorse =
          getComputedStyle(document.documentElement).getPropertyValue("--color-gorse").trim() ||
          "#b8863a";
        map.addSource("approximate-area", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "Point", coordinates: [longitude, latitude] },
          },
        });
        map.addLayer({
          id: "approximate-area-fill",
          type: "circle",
          source: "approximate-area",
          paint: {
            "circle-radius": metersToPixelsAtZoom(radiusMeters, latitude, 11),
            "circle-color": gorse,
            "circle-opacity": 0.25,
            "circle-stroke-width": 2,
            "circle-stroke-color": gorse,
          },
        });
      });
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [latitude, longitude, radiusMeters]);

  return (
    <div ref={containerRef} role="img" aria-label={label} className="h-full min-h-[240px] w-full" />
  );
}

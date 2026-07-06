"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "./osm-map";

// Leaflet touches `window` on import, so load the map client-only (no SSR).
const OsmMap = dynamic(() => import("./osm-map").then((m) => m.OsmMap), {
  ssr: false,
  loading: () => <div className="flex h-[360px] items-center justify-center rounded-xl border bg-background text-sm text-muted">加载地图…</div>,
});

export function MapEmbed(props: { center: [number, number]; zoom?: number; markers?: MapMarker[]; height?: number }) {
  return <OsmMap {...props} />;
}

export type { MapMarker };

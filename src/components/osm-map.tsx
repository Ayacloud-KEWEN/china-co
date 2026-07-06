"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type MapMarker = { lat: number; lon: number; label: string; sub?: string };

export function OsmMap({
  center, zoom = 11, markers = [], height = 360,
}: {
  center: [number, number]; zoom?: number; markers?: MapMarker[]; height?: number;
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-xl border">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <CircleMarker key={i} center={[m.lat, m.lon]} radius={7} pathOptions={{ color: "#1e3a8a", fillColor: "#2563eb", fillOpacity: 0.8, weight: 2 }}>
            <Tooltip>
              <div className="text-xs">
                <div className="font-medium">{m.label}</div>
                {m.sub && <div className="text-muted">{m.sub}</div>}
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

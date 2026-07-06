// OpenStreetMap via the Overpass API — keyless. Fetches named industrial sites
// (landuse=industrial with a name) inside a city bounding box.
// Docs: https://wiki.openstreetmap.org/wiki/Overpass_API

const UA = "ChinaMOS/0.1 (contact@example.com)";
const ENDPOINT = "https://overpass-api.de/api/interpreter";

export type Bbox = [south: number, west: number, north: number, east: number];
export type IndustrialSite = { name: string; lat: number; lon: number };

export async function getIndustrialSites(bbox: Bbox, limit = 8): Promise<IndustrialSite[]> {
  const [s, w, n, e] = bbox;
  const query =
    `[out:json][timeout:25];` +
    `(node["landuse"="industrial"]["name"](${s},${w},${n},${e});` +
    `way["landuse"="industrial"]["name"](${s},${w},${n},${e}););` +
    `out center ${limit * 3};`;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) return [];
    const j = await res.json();
    const seen = new Set<string>();
    const sites: IndustrialSite[] = [];
    for (const el of j.elements ?? []) {
      const name = el.tags?.name as string | undefined;
      if (!name || seen.has(name)) continue;
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (lat == null || lon == null) continue;
      seen.add(name);
      sites.push({ name, lat, lon });
      if (sites.length >= limit) break;
    }
    return sites;
  } catch {
    return [];
  }
}

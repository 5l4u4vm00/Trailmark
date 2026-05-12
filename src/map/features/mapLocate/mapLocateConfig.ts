export const WGS84_LAT_RANGE: readonly [number, number] = [-90, 90];
export const WGS84_LNG_RANGE: readonly [number, number] = [-180, 180];

export const DEFAULT_LOCATE_ZOOM = 16;

export function parseDecimal(input: string): number | null {
  const trimmed = input?.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export type ValidateResult = { ok: true } | { ok: false; reason: string };

export function validateLatLng(lat: number | null, lng: number | null): ValidateResult {
  if (lat === null || lng === null) {
    return { ok: false, reason: 'Latitude and longitude must be numbers.' };
  }
  if (lat < WGS84_LAT_RANGE[0] || lat > WGS84_LAT_RANGE[1]) {
    return { ok: false, reason: `Latitude must be between ${WGS84_LAT_RANGE[0]} and ${WGS84_LAT_RANGE[1]}.` };
  }
  if (lng < WGS84_LNG_RANGE[0] || lng > WGS84_LNG_RANGE[1]) {
    return { ok: false, reason: `Longitude must be between ${WGS84_LNG_RANGE[0]} and ${WGS84_LNG_RANGE[1]}.` };
  }
  return { ok: true };
}

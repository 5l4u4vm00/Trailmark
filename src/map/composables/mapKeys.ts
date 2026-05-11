/**
 * Centralised registry of map keys.
 *
 * When adding a new map instance (e.g. an interactive map inside a panel),
 * append it here and reference it as `MAP_KEYS.XXX` so the raw string isn't
 * scattered across features.
 *
 * Example:
 * ```ts
 * import { MAP_KEYS } from '@/map/composables/mapKeys';
 * useMap(MAP_KEYS.MAIN);
 * ```
 */
export const MAP_KEYS = {
  MAIN: 'main',
  // PANEL_A: 'panelA',  // Example: add panel maps here later
} as const;

/** Default map key; calls without a key fall back to this. */
export const DEFAULT_MAP_KEY: string = MAP_KEYS.MAIN;

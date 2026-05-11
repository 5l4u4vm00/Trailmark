import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { DEFAULT_BASEMAP_KEY } from './basemapConfig';
import { DEFAULT_MAP_KEY } from '@/map/composables/useMap';

/**
 * Basemap selection state store.
 * Buckets state by mapKey so the main map and secondary panel maps can each
 * remember their own current basemap.
 */
export const useBasemapStore = defineStore('basemap', () => {
  /** Currently selected basemap key per mapKey */
  const currentBasemapKeyMap = ref<Record<string, string>>({});

  function getCurrentBasemap(mapKey: string = DEFAULT_MAP_KEY): string {
    return currentBasemapKeyMap.value[mapKey] ?? DEFAULT_BASEMAP_KEY;
  }

  function setCurrentBasemap(mapKey: string, basemapKey: string): void {
    currentBasemapKeyMap.value[mapKey] = basemapKey;
  }

  return {
    currentBasemapKeyMap,
    getCurrentBasemap,
    setCurrentBasemap,
  };
});

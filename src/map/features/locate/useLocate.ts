import { ref } from 'vue';
import { DEFAULT_MAP_KEY, useMap } from '@/map/composables/useMap';

export interface LocateOptions {
  zoom?: number;
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
}

/**
 * Get the locate controller for the given mapKey.
 *
 * @param mapKey Map key, defaults to `'main'`
 */
export function useLocate(mapKey: string = DEFAULT_MAP_KEY) {
  const { whenMapReady } = useMap(mapKey);
  const locating = ref(false);
  const error = ref<string | null>(null);

  async function locate(options: LocateOptions = {}): Promise<void> {
    if (!('geolocation' in navigator)) {
      error.value = 'Geolocation is not supported in this browser';
      return;
    }
    locating.value = true;
    error.value = null;

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeoutMs ?? 10_000,
        });
      });

      const map = await whenMapReady();
      map.flyTo({
        center: [position.coords.longitude, position.coords.latitude],
        zoom: options.zoom ?? 16,
      });
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to locate';
    } finally {
      locating.value = false;
    }
  }

  return { locate, locating, error };
}

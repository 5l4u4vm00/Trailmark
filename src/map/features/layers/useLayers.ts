import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { DEFAULT_MAP_KEY, useMap } from '@/map/composables/useMap';
import { LAYER_CONFIG } from './layerConfig';

/**
 * Get the layer synchroniser for the given mapKey.
 * Each mapKey has its own independent watch(isLogin).
 *
 * @param mapKey Map key, defaults to `'main'`
 */
export function useLayers(mapKey: string = DEFAULT_MAP_KEY) {
  const { whenMapReady } = useMap(mapKey);

  async function syncLayers(): Promise<void> {
    const map = await whenMapReady();

    for (const def of LAYER_CONFIG) {
      const present = !!map.getSource(def.id);

      if (!present) {
        map.addSource(def.id, def.source);
        for (const layer of def.layers) {
          if (!map.getLayer(layer.id)) {
            map.addLayer(layer);
          }
        }
      } else if (present) {
        for (const layer of def.layers) {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
        }
        map.removeSource(def.id);
      }
    }
  }

  return { syncLayers };
}

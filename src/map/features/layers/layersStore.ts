import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DEFAULT_MAP_KEY } from '@/map/composables/useMap';
import { LAYER_CONFIG } from './layerConfig';

export interface LayerState {
  visible: boolean;
  opacity: number;
}

function defaultStateForMap(): Record<string, LayerState> {
  const out: Record<string, LayerState> = {};
  for (const def of LAYER_CONFIG) {
    out[def.id] = {
      visible: def.defaultVisible ?? false,
      opacity: def.defaultOpacity ?? 100,
    };
  }
  return out;
}

/**
 * Per-mapKey layer visibility / opacity state.
 * Buckets state by mapKey so the main map and any secondary panel maps each
 * remember their own selections.
 */
export const useLayersStore = defineStore('layers', () => {
  const stateByMap = ref<Record<string, Record<string, LayerState>>>({});

  function ensureMap(mapKey: string = DEFAULT_MAP_KEY): Record<string, LayerState> {
    if (!stateByMap.value[mapKey]) {
      stateByMap.value[mapKey] = defaultStateForMap();
    }
    return stateByMap.value[mapKey];
  }

  function getState(
    mapKey: string = DEFAULT_MAP_KEY,
    layerId: string,
  ): LayerState {
    const bucket = ensureMap(mapKey);
    if (!bucket[layerId]) {
      bucket[layerId] = { visible: false, opacity: 100 };
    }
    return bucket[layerId];
  }

  function setVisible(mapKey: string, layerId: string, visible: boolean): void {
    getState(mapKey, layerId).visible = visible;
  }

  function setOpacity(mapKey: string, layerId: string, opacity: number): void {
    getState(mapKey, layerId).opacity = opacity;
  }

  function resetAll(mapKey: string = DEFAULT_MAP_KEY): void {
    stateByMap.value[mapKey] = defaultStateForMap();
  }

  return {
    stateByMap,
    ensureMap,
    getState,
    setVisible,
    setOpacity,
    resetAll,
  };
});

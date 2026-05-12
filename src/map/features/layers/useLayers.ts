import type { Map as MaplibreMap, LayerSpecification } from 'maplibre-gl';
import { DEFAULT_MAP_KEY, useMap } from '@/map/composables/useMap';
import { LAYER_CONFIG, opacityPaintProp, getLayerDef } from './layerConfig';
import { useLayersStore } from './layersStore';

/**
 * Currently mounted overlay layer / source ids per mapKey.
 * Lives at module scope so panel unmount/remount doesn't lose references.
 */
const layerIdsByMap = new Map<string, Set<string>>();
const sourceIdsByMap = new Map<string, Set<string>>();

function getLayerIdSet(mapKey: string): Set<string> {
  let set = layerIdsByMap.get(mapKey);
  if (!set) {
    set = new Set();
    layerIdsByMap.set(mapKey, set);
  }
  return set;
}

function getSourceIdSet(mapKey: string): Set<string> {
  let set = sourceIdsByMap.get(mapKey);
  if (!set) {
    set = new Set();
    sourceIdsByMap.set(mapKey, set);
  }
  return set;
}

function applyOpacityToLayer(
  map: MaplibreMap,
  layer: LayerSpecification,
  opacity01: number,
): void {
  const prop = opacityPaintProp(layer);
  if (!prop) return;
  // hillshade-exaggeration is an effect intensity, not a true opacity, but is
  // the closest analogue we have for the slider; clamp to [0, 1].
  const value =
    layer.type === 'hillshade'
      ? Math.max(0, Math.min(1, opacity01))
      : opacity01;
  map.setPaintProperty(layer.id, prop, value);
  if (layer.type === 'symbol') {
    map.setPaintProperty(layer.id, 'icon-opacity', opacity01);
  }
}

export function useLayers(mapKey: string = DEFAULT_MAP_KEY) {
  const { whenMapReady } = useMap(mapKey);
  const store = useLayersStore();

  async function initLayers(): Promise<void> {
    const map = await whenMapReady();
    store.ensureMap(mapKey);

    const layerIds = getLayerIdSet(mapKey);
    const sourceIds = getSourceIdSet(mapKey);

    for (const def of LAYER_CONFIG) {
      if (!map.getSource(def.id)) {
        map.addSource(def.id, def.source);
        sourceIds.add(def.id);
      }
      for (const layer of def.layers) {
        if (!map.getLayer(layer.id)) {
          map.addLayer(layer);
          layerIds.add(layer.id);
        }
      }

      const state = store.getState(mapKey, def.id);
      applyVisibility(map, def.id, state.visible);
      applyOpacity(map, def.id, state.opacity);
    }
  }

  function applyVisibility(
    map: MaplibreMap,
    layerId: string,
    visible: boolean,
  ): void {
    const def = getLayerDef(layerId);
    if (!def) return;
    for (const layer of def.layers) {
      if (!map.getLayer(layer.id)) continue;
      map.setLayoutProperty(
        layer.id,
        'visibility',
        visible ? 'visible' : 'none',
      );
    }
  }

  function applyOpacity(
    map: MaplibreMap,
    layerId: string,
    opacity: number,
  ): void {
    const def = getLayerDef(layerId);
    if (!def) return;
    const o = Math.max(0, Math.min(100, opacity)) / 100;
    for (const layer of def.layers) {
      if (!map.getLayer(layer.id)) continue;
      applyOpacityToLayer(map, layer, o);
    }
  }

  async function setVisible(layerId: string, visible: boolean): Promise<void> {
    store.setVisible(mapKey, layerId, visible);
    const map = await whenMapReady();
    applyVisibility(map, layerId, visible);
  }

  async function setOpacity(layerId: string, opacity: number): Promise<void> {
    store.setOpacity(mapKey, layerId, opacity);
    const map = await whenMapReady();
    applyOpacity(map, layerId, opacity);
  }

  async function resetAll(): Promise<void> {
    store.resetAll(mapKey);
    const map = await whenMapReady();
    for (const def of LAYER_CONFIG) {
      const state = store.getState(mapKey, def.id);
      applyVisibility(map, def.id, state.visible);
      applyOpacity(map, def.id, state.opacity);
    }
  }

  return {
    initLayers,
    setVisible,
    setOpacity,
    resetAll,
    layers: LAYER_CONFIG,
  };
}

import type {
  Map as MaplibreMap,
  LayerSpecification,
  SourceSpecification,
  StyleSpecification,
} from 'maplibre-gl';
import { DEFAULT_MAP_KEY, useMap } from '@/map/composables/useMap';
import {
  BASEMAP_CONFIG,
  getBasemapDef,
  type BasemapDef,
} from './basemapConfig';
import { useBasemapStore } from './basemapStore';

/**
 * Currently mounted basemap layer / source ids per mapKey.
 * These belong to the map instance and must not be reset when components that
 * call useBasemap() are unmounted.
 */
const layerIdsByMap = new Map<string, string[]>();
const sourceIdsByMap = new Map<string, string[]>();

function getLayerIds(mapKey: string): string[] {
  let ids = layerIdsByMap.get(mapKey);
  if (!ids) {
    ids = [];
    layerIdsByMap.set(mapKey, ids);
  }
  return ids;
}

function getSourceIds(mapKey: string): string[] {
  let ids = sourceIdsByMap.get(mapKey);
  if (!ids) {
    ids = [];
    sourceIdsByMap.set(mapKey, ids);
  }
  return ids;
}

function rasterPrefix(key: string): string {
  return `bm-${key}`;
}

function vectorPrefix(key: string): string {
  return `bm-${key}-`;
}

async function removeCurrentBasemap(map: MaplibreMap, mapKey: string): Promise<void> {
  const layerIds = getLayerIds(mapKey);
  const sourceIds = getSourceIds(mapKey);

  for (const id of layerIds) {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  }
  layerIds.length = 0;

  for (const id of sourceIds) {
    if (map.getSource(id)) {
      map.removeSource(id);
    }
  }
  sourceIds.length = 0;
}

function firstNonBasemapLayerId(map: MaplibreMap, mapKey: string): string | undefined {
  const layerIds = getLayerIds(mapKey);
  const layers = map.getStyle().layers ?? [];
  return layers.find((l) => !layerIds.includes(l.id))?.id;
}

function addRasterBasemap(map: MaplibreMap, mapKey: string, def: BasemapDef): void {
  const sourceId = rasterPrefix(def.key);
  const layerId = `${sourceId}-layer`;

  const source: SourceSpecification = {
    type: 'raster',
    tiles: [def.url],
    tileSize: 256,
  };
  const layer: LayerSpecification = {
    id: layerId,
    type: 'raster',
    source: sourceId,
  };

  map.addSource(sourceId, source);
  map.addLayer(layer, firstNonBasemapLayerId(map, mapKey));
  getSourceIds(mapKey).push(sourceId);
  getLayerIds(mapKey).push(layerId);
}

async function addVectorBasemap(
  map: MaplibreMap,
  mapKey: string,
  def: BasemapDef,
): Promise<void> {
  const res = await fetch(def.url);
  if (!res.ok) {
    throw new Error(`Failed to load vector basemap (${def.key}): ${res.status}`);
  }
  const style = (await res.json()) as StyleSpecification;
  const prefix = vectorPrefix(def.key);

  // Prefix every source id to avoid collisions between different vector styles
  const sourceIdMap = new Map<string, string>();
  const sourceIds = getSourceIds(mapKey);
  for (const [origId, src] of Object.entries(style.sources ?? {})) {
    const newId = `${prefix}${origId}`;
    map.addSource(newId, src as SourceSpecification);
    sourceIdMap.set(origId, newId);
    sourceIds.push(newId);
  }

  const beforeId = firstNonBasemapLayerId(map, mapKey);
  const layerIds = getLayerIds(mapKey);
  for (const origLayer of style.layers ?? []) {
    const cloned: LayerSpecification = { ...origLayer, id: `${prefix}${origLayer.id}` };
    // Background layers have no source; other layers must repoint to the prefixed source id
    if ('source' in origLayer && origLayer.source) {
      const mapped = sourceIdMap.get(origLayer.source as string);
      if (mapped) {
        (cloned as { source: string }).source = mapped;
      }
    }
    map.addLayer(cloned, beforeId);
    layerIds.push(cloned.id);
  }
}

async function applyBasemap(
  map: MaplibreMap,
  mapKey: string,
  def: BasemapDef,
): Promise<void> {
  await removeCurrentBasemap(map, mapKey);
  if (def.kind === 'raster') {
    addRasterBasemap(map, mapKey, def);
  } else {
    await addVectorBasemap(map, mapKey, def);
  }
}

/**
 * Get the basemap controller for the given mapKey.
 * Each mapKey maintains its own current basemap, layer ids and source ids.
 *
 * @param mapKey Map key, defaults to `'main'`
 */
export function useBasemap(mapKey: string = DEFAULT_MAP_KEY) {
  const { whenMapReady } = useMap(mapKey);
  const store = useBasemapStore();

  async function setBasemap(key: string): Promise<void> {
    const def = getBasemapDef(key);
    if (!def) {
      console.error(`[basemap] Basemap config not found: ${key}`);
      return;
    }
    const map = await whenMapReady();
    try {
      await applyBasemap(map, mapKey, def);
      store.setCurrentBasemap(mapKey, key);
    } catch (err) {
      console.error('[basemap] Failed to switch basemap', err);
    }
  }

  async function initBasemap(): Promise<void> {
    await setBasemap(store.getCurrentBasemap(mapKey));
  }

  return {
    setBasemap,
    initBasemap,
    basemaps: BASEMAP_CONFIG,
  };
}

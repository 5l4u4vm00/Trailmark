import { getCurrentInstance, onBeforeUnmount, shallowRef, type ShallowRef } from 'vue';
import * as maplibregl from 'maplibre-gl';
export { MAP_KEYS, DEFAULT_MAP_KEY } from './mapKeys';
import { DEFAULT_MAP_KEY } from './mapKeys';

/**
 * Ready state and resources for a single map instance.
 * Multiple maps are distinguished by key; each maintains its own entry, so
 * init / ready / destroy don't interfere with each other.
 */
type MapEntry = {
  mapRef: ShallowRef<maplibregl.Map | null>;
  readyPromise: Promise<maplibregl.Map>;
  readyResolve: ((m: maplibregl.Map) => void) | null;
  readyReject: ((err: unknown) => void) | null;
};

const entries = new Map<string, MapEntry>();

function newReadyPromise(entry: MapEntry): Promise<maplibregl.Map> {
  return new Promise<maplibregl.Map>((resolve, reject) => {
    entry.readyResolve = resolve;
    entry.readyReject = reject;
  });
}

function createEntry(): MapEntry {
  const entry: MapEntry = {
    mapRef: shallowRef<maplibregl.Map | null>(null),
    readyPromise: undefined as unknown as Promise<maplibregl.Map>,
    readyResolve: null,
    readyReject: null,
  };
  entry.readyPromise = newReadyPromise(entry);
  return entry;
}

function getEntry(key: string): MapEntry {
  let entry = entries.get(key);
  if (!entry) {
    entry = createEntry();
    entries.set(key, entry);
  }
  return entry;
}

function initEntry(
  entry: MapEntry,
  container: HTMLElement,
  options: Omit<maplibregl.MapOptions, 'container'>,
): void {
  if (entry.mapRef.value) {
    destroyEntry(entry);
  }
  const m = new maplibregl.Map({ container, ...options });
  m.once('load', () => {
    entry.mapRef.value = m;
    entry.readyResolve?.(m);
    // Fix short canvas height (bottom white strip) when layout hasn't settled at init time
    m.resize();
  });
  m.on('error', (e: maplibregl.ErrorEvent) => {
    entry.readyReject?.(e.error ?? new Error('maplibre error'));
  });
}

function destroyEntry(entry: MapEntry): void {
  entry.readyReject?.(new Error('map destroyed'));
  entry.mapRef.value?.remove();
  entry.mapRef.value = null;
  entry.readyPromise = newReadyPromise(entry);
}

/**
 * Wait for the map with the given key to be ready, then run fn. Cleanup is
 * automatic on component unmount. fn may return a cleanup function that will
 * be invoked on unmount — useful for unbinding event listeners.
 *
 * Must be called synchronously inside `<script setup>`, same as other
 * lifecycle hooks.
 *
 * When to use:
 * - ✅ Binding MapLibre events in component setup that need to be unbound on unmount
 *   (e.g. listening to rotate/zoom/move to sync UI, handling click/mousemove)
 * - ✅ Creating imperative functions used by the template repeatedly so we don't
 *   await on every click (e.g. a button's onClick)
 * - ✅ Registering layers / sources and cleaning them up on unmount
 * - ✅ Unifying the entry point for getting the map across features (recommended
 *   for style consistency even when no cleanup is needed)
 *
 * Not for:
 * - ❌ Non-Vue contexts (pure utility / service): use `whenMapReady()` instead
 * - ❌ One-shot calls outside a component lifecycle: use `whenMapReady()` instead
 * - ❌ Scenarios that need re-binding after a map rebuild (HMR): currently only
 *   resolves once
 *
 * @example
 * // Bind an event and sync state
 * const bearing = ref(0);
 * onMapReady((m) => {
 *   const sync = () => (bearing.value = m.getBearing());
 *   sync();
 *   m.on('rotate', sync);
 *   return () => m.off('rotate', sync);
 * });
 */
function onMapReadyFor(
  key: string,
  fn: (map: maplibregl.Map) => void | (() => void),
): void {
  const entry = getEntry(key);
  const instance = getCurrentInstance();
  let cleanup: (() => void) | void;
  let unmounted = false;

  if (instance) {
    onBeforeUnmount(() => {
      unmounted = true;
      cleanup?.();
    });
  }

  entry.readyPromise.then((m) => {
    if (unmounted) {
      return;
    }
    cleanup = fn(m);
  });
}

/**
 * Shortcut to onMapReady for the main map (key=`'main'`), kept for backward
 * compatibility with existing callers. For secondary maps such as panel maps,
 * use `useMap(key).onMapReady(fn)` instead.
 */
export function onMapReady(fn: (map: maplibregl.Map) => void | (() => void)): void {
  onMapReadyFor(DEFAULT_MAP_KEY, fn);
}

/**
 * Get the map control interface for the given key.
 * Multiple calls with the same key share the same internal state
 * (mapRef / readyPromise).
 *
 * @param key Map key, defaults to `'main'`
 */
export function useMap(key: string = DEFAULT_MAP_KEY) {
  const entry = getEntry(key);
  return {
    map: entry.mapRef,
    whenMapReady: () => entry.readyPromise,
    onMapReady: (fn: (map: maplibregl.Map) => void | (() => void)) => onMapReadyFor(key, fn),
    init: (container: HTMLElement, options: Omit<maplibregl.MapOptions, 'container'>) =>
      initEntry(entry, container, options),
    destroy: () => destroyEntry(entry),
  };
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    for (const entry of entries.values()) {
      destroyEntry(entry);
    }
  });
}

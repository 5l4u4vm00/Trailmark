import * as maplibregl from 'maplibre-gl';
import { useMap, DEFAULT_MAP_KEY } from '@/map/composables/useMap';
import { DEFAULT_LOCATE_ZOOM, validateLatLng } from './mapLocateConfig';
import { useMapLocateStore, type LocatedPoint } from './mapLocateStore';

export function useMapLocate(mapKey: string = DEFAULT_MAP_KEY) {
  const { onMapReady, map: mapRef } = useMap(mapKey);
  const store = useMapLocateStore();

  let marker: maplibregl.Marker | null = null;

  function placeMarker(map: maplibregl.Map, point: LocatedPoint) {
    if (marker) {
      marker.setLngLat([point.lng, point.lat]);
    } else {
      marker = new maplibregl.Marker()
        .setLngLat([point.lng, point.lat])
        .addTo(map);
    }
  }

  function removeMarker() {
    marker?.remove();
    marker = null;
  }

  onMapReady((map) => {
    const existing = store.getPoint(mapKey);
    if (existing) {
      placeMarker(map, existing);
    }
    return () => {
      removeMarker();
    };
  });

  function locate(lat: number, lng: number): { ok: true } | { ok: false; reason: string } {
    const check = validateLatLng(lat, lng);
    if (!check.ok) return check;

    const point: LocatedPoint = { lat, lng };
    store.setPoint(mapKey, point);

    const map = mapRef.value;
    if (map) {
      map.flyTo({ center: [lng, lat], zoom: DEFAULT_LOCATE_ZOOM });
      placeMarker(map, point);
    }
    return { ok: true };
  }

  function reset() {
    removeMarker();
    store.reset(mapKey);
  }

  return { locate, reset };
}

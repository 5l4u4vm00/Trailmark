import type { Map as MaplibreMap } from 'maplibre-gl';
import type { Feature, LineString, Polygon, Position } from 'geojson';
// @ts-expect-error — package ships without bundled types
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { DEFAULT_MAP_KEY, useMap } from '@/map/composables/useMap';
import { Distance } from './domain/Distance';
import { Area } from './domain/Area';
import {
  MAX_MEASUREMENTS,
  pickColor,
} from './measurementConfig';
import {
  useMeasurementStore,
  type MeasurementMode,
  type MeasurementRow,
} from './measurementStore';

// Re-skin MapboxDraw's default CSS classes for MapLibre compatibility.
// Safe to run multiple times; idempotent.
const DrawCtor = MapboxDraw as unknown as {
  constants: { classes: Record<string, string> };
  new (...args: unknown[]): unknown;
};
DrawCtor.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
DrawCtor.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
DrawCtor.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

interface Session {
  map: MaplibreMap;
  draw: any;
  handlers: Array<[string, (e: any) => void]>;
}

const sessionByMap = new Map<string, Session>();

type DrawFeature = Feature<LineString | Polygon, { color?: string; label?: string }>;

function modeToDrawMode(mode: MeasurementMode): string {
  return mode === 'distance' ? 'draw_line_string' : 'draw_polygon';
}

function defaultLabel(mode: MeasurementMode, rows: MeasurementRow[]): string {
  const n = rows.filter((r) => r.mode === mode).length + 1;
  return mode === 'distance' ? `Distance #${n}` : `Area #${n}`;
}

function featureToRow(
  feature: DrawFeature,
  existing: MeasurementRow | undefined,
  rowsForColor: MeasurementRow[],
): MeasurementRow | null {
  const id = String(feature.id);
  const geom = feature.geometry;
  if (geom.type === 'LineString') {
    const coords = geom.coordinates as Position[];
    if (coords.length < 2) return null;
    const color =
      existing?.color ?? feature.properties.color ?? pickColor(rowsForColor.length);
    return {
      id,
      mode: 'distance',
      color,
      label: existing?.label ?? feature.properties.label ?? defaultLabel('distance', rowsForColor),
      meters: Distance.fromCoordinates(coords).meters,
    };
  }
  if (geom.type === 'Polygon') {
    const ring = (geom.coordinates?.[0] ?? []) as Position[];
    if (ring.length < 4) return null; // closed polygon needs ≥4 positions
    const color =
      existing?.color ?? feature.properties.color ?? pickColor(rowsForColor.length);
    return {
      id,
      mode: 'area',
      color,
      label: existing?.label ?? feature.properties.label ?? defaultLabel('area', rowsForColor),
      squareMeters: Area.fromRing(ring).squareMeters,
    };
  }
  return null;
}

export function useMeasurement(mapKey: string = DEFAULT_MAP_KEY) {
  const store = useMeasurementStore();

  function paintExpr(prop: string, fallback: string) {
    return ['coalesce', ['get', 'user_' + prop], fallback];
  }

  function buildDrawStyles() {
    return [
      // Line strings (distance) — inactive
      {
        id: 'gl-draw-line-inactive',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
        paint: {
          'line-color': paintExpr('color', '#3498db'),
          'line-width': 3,
        },
      },
      // Line strings — active (being drawn or selected)
      {
        id: 'gl-draw-line-active',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
        paint: {
          'line-color': paintExpr('color', '#3498db'),
          'line-width': 3,
          'line-dasharray': [0.2, 2],
        },
      },
      // Polygon fill
      {
        id: 'gl-draw-polygon-fill',
        type: 'fill',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': paintExpr('color', '#3498db'),
          'fill-outline-color': paintExpr('color', '#3498db'),
          'fill-opacity': 0.18,
        },
      },
      // Polygon outline
      {
        id: 'gl-draw-polygon-stroke',
        type: 'line',
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'line-color': paintExpr('color', '#3498db'),
          'line-width': 2,
        },
      },
      // Vertex points
      {
        id: 'gl-draw-vertex',
        type: 'circle',
        filter: [
          'all',
          ['==', 'meta', 'vertex'],
          ['==', '$type', 'Point'],
        ],
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-color': paintExpr('color', '#3498db'),
          'circle-stroke-width': 2,
        },
      },
      // Midpoints (for inserting new vertices)
      {
        id: 'gl-draw-midpoint',
        type: 'circle',
        filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
        paint: {
          'circle-radius': 3,
          'circle-color': '#ffffff',
          'circle-stroke-color': paintExpr('color', '#3498db'),
          'circle-stroke-width': 1,
        },
      },
    ];
  }

  function startSession(): void {
    if (sessionByMap.has(mapKey)) return;
    useMap(mapKey).whenMapReady().then((map) => {
      if (sessionByMap.has(mapKey)) return;
      const draw = new (DrawCtor as any)({
        displayControlsDefault: false,
        userProperties: true,
        styles: buildDrawStyles(),
      });
      map.addControl(draw as any);
      // Default mode
      draw.changeMode(modeToDrawMode(store.getMode(mapKey)));

      const onCreate = (e: { features: DrawFeature[] }) => {
        for (const f of e.features) {
          const rows = store.getRows(mapKey);
          const color = pickColor(rows.length);
          // Stamp color into the draw feature so the style sees it.
          draw.setFeatureProperty(f.id, 'color', color);
          // Re-fetch the feature with updated props for accurate row creation.
          const fresh = draw.get(f.id) as DrawFeature | undefined;
          const row = featureToRow(fresh ?? f, undefined, rows);
          if (row) store.upsertRow(mapKey, row);
        }
        // Finishing a sketch (double-click) returns to selection mode.
        // The CREATE event fires while mapbox-gl-draw is still inside its
        // own changeMode transition, so defer to the next tick before
        // forcing the mode again — otherwise the nested changeMode can
        // leave draw mode partially active.
        queueMicrotask(() => {
          if (sessionByMap.get(mapKey)?.draw === draw) {
            draw.changeMode('simple_select', { featureIds: [] });
          }
        });
      };

      const onUpdate = (e: { features: DrawFeature[] }) => {
        for (const f of e.features) {
          const id = String(f.id);
          const existing = store.getRows(mapKey).find((r) => r.id === id);
          const row = featureToRow(f, existing, store.getRows(mapKey));
          if (row) store.upsertRow(mapKey, row);
        }
      };

      const onDelete = (e: { features: DrawFeature[] }) => {
        for (const f of e.features) {
          store.removeRow(mapKey, String(f.id));
        }
      };

      const onModechange = (e: { mode: string }) => {
        if (e.mode !== 'direct_select') {
          store.setEditing(mapKey, null);
        }
      };

      const handlers: Array<[string, (e: any) => void]> = [
        ['draw.create', onCreate],
        ['draw.update', onUpdate],
        ['draw.delete', onDelete],
        ['draw.modechange', onModechange],
      ];
      for (const [evt, fn] of handlers) {
        (map as any).on(evt, fn);
      }

      sessionByMap.set(mapKey, { map, draw, handlers });
    });
  }

  function endSession(): void {
    const s = sessionByMap.get(mapKey);
    if (!s) {
      store.clearAll(mapKey);
      return;
    }
    for (const [evt, fn] of s.handlers) {
      (s.map as any).off(evt, fn);
    }
    try {
      s.map.removeControl(s.draw);
    } catch {
      // map may already be torn down
    }
    sessionByMap.delete(mapKey);
    store.clearAll(mapKey);
  }

  function setMode(mode: MeasurementMode): void {
    store.setMode(mapKey, mode);
    const s = sessionByMap.get(mapKey);
    if (!s) return;
    if (store.getRows(mapKey).length >= MAX_MEASUREMENTS) {
      s.draw.changeMode('simple_select');
      return;
    }
    s.draw.changeMode(modeToDrawMode(mode));
  }

  function deleteRow(id: string): void {
    const s = sessionByMap.get(mapKey);
    if (s) {
      try {
        s.draw.delete(id);
      } catch {
        /* feature already gone */
      }
    }
    store.removeRow(mapKey, id);
  }

  function renameRow(id: string, label: string): void {
    store.renameRow(mapKey, id, label);
    const s = sessionByMap.get(mapKey);
    if (s) {
      try {
        s.draw.setFeatureProperty(id, 'label', label);
      } catch {
        /* feature missing */
      }
    }
  }

  function beginEditVertices(id: string): void {
    const s = sessionByMap.get(mapKey);
    if (!s) return;
    s.draw.changeMode('direct_select', { featureId: id });
    store.setEditing(mapKey, id);
  }

  function finishEdit(): void {
    const s = sessionByMap.get(mapKey);
    if (!s) return;
    s.draw.changeMode('simple_select');
    store.setEditing(mapKey, null);
  }

  return {
    startSession,
    endSession,
    setMode,
    deleteRow,
    renameRow,
    beginEditVertices,
    finishEdit,
  };
}

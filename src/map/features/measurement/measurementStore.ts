import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DEFAULT_MAP_KEY } from '@/map/composables/useMap';

export type MeasurementMode = 'distance' | 'area';

export interface MeasurementRow {
  id: string;
  mode: MeasurementMode;
  color: string;
  label: string;
  meters?: number;
  squareMeters?: number;
}

interface MapState {
  mode: MeasurementMode;
  rows: MeasurementRow[];
  selectedId: string | null;
  editingId: string | null;
}

function emptyState(): MapState {
  return { mode: 'distance', rows: [], selectedId: null, editingId: null };
}

export const useMeasurementStore = defineStore('measurement', () => {
  const stateByMap = ref<Record<string, MapState>>({});

  function ensure(mapKey: string): MapState {
    if (!stateByMap.value[mapKey]) {
      stateByMap.value[mapKey] = emptyState();
    }
    return stateByMap.value[mapKey];
  }

  function getMode(mapKey: string = DEFAULT_MAP_KEY): MeasurementMode {
    return ensure(mapKey).mode;
  }

  function setMode(mapKey: string, mode: MeasurementMode): void {
    ensure(mapKey).mode = mode;
  }

  function getRows(mapKey: string = DEFAULT_MAP_KEY): MeasurementRow[] {
    return ensure(mapKey).rows;
  }

  function upsertRow(mapKey: string, row: MeasurementRow): void {
    const s = ensure(mapKey);
    const idx = s.rows.findIndex((r) => r.id === row.id);
    if (idx === -1) {
      s.rows.push(row);
    } else {
      s.rows.splice(idx, 1, { ...s.rows[idx], ...row });
    }
  }

  function removeRow(mapKey: string, id: string): void {
    const s = ensure(mapKey);
    s.rows = s.rows.filter((r) => r.id !== id);
    if (s.selectedId === id) s.selectedId = null;
    if (s.editingId === id) s.editingId = null;
  }

  function renameRow(mapKey: string, id: string, label: string): void {
    const s = ensure(mapKey);
    const row = s.rows.find((r) => r.id === id);
    if (row) row.label = label;
  }

  function setEditing(mapKey: string, id: string | null): void {
    ensure(mapKey).editingId = id;
  }

  function getEditing(mapKey: string = DEFAULT_MAP_KEY): string | null {
    return ensure(mapKey).editingId;
  }

  function clearAll(mapKey: string): void {
    stateByMap.value[mapKey] = emptyState();
  }

  return {
    stateByMap,
    getMode,
    setMode,
    getRows,
    upsertRow,
    removeRow,
    renameRow,
    setEditing,
    getEditing,
    clearAll,
  };
});

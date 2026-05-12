import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DEFAULT_MAP_KEY } from '@/map/composables/useMap';

export interface LocatedPoint {
  lat: number;
  lng: number;
}

export interface CoordInput {
  lat: string;
  lng: string;
}

interface MapState {
  point: LocatedPoint | null;
  coordInput: CoordInput;
}

function emptyState(): MapState {
  return { point: null, coordInput: { lat: '', lng: '' } };
}

export const useMapLocateStore = defineStore('mapLocate', () => {
  const stateByMap = ref<Record<string, MapState>>({});

  function ensure(mapKey: string): MapState {
    if (!stateByMap.value[mapKey]) {
      stateByMap.value[mapKey] = emptyState();
    }
    return stateByMap.value[mapKey];
  }

  function getPoint(mapKey: string = DEFAULT_MAP_KEY): LocatedPoint | null {
    return ensure(mapKey).point;
  }

  function setPoint(mapKey: string, point: LocatedPoint | null): void {
    ensure(mapKey).point = point;
  }

  function getCoordInput(mapKey: string = DEFAULT_MAP_KEY): CoordInput {
    return ensure(mapKey).coordInput;
  }

  function setCoordInput(mapKey: string, input: CoordInput): void {
    ensure(mapKey).coordInput = input;
  }

  function reset(mapKey: string = DEFAULT_MAP_KEY): void {
    stateByMap.value[mapKey] = emptyState();
  }

  return {
    stateByMap,
    getPoint,
    setPoint,
    getCoordInput,
    setCoordInput,
    reset,
  };
});

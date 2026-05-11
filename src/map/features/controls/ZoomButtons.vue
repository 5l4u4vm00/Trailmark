<script setup lang="ts">
import type * as maplibregl from "maplibre-gl";
import { DEFAULT_MAP_KEY, useMap } from "@/map/composables/useMap";

const props = defineProps<{
  /** Map key, defaults to 'main' */
  mapKey?: string;
}>();

const { onMapReady } = useMap(props.mapKey ?? DEFAULT_MAP_KEY);

let mapInstance: maplibregl.Map | null = null;

onMapReady((m) => {
  mapInstance = m;
});

function zoomIn() {
  mapInstance?.zoomIn();
}

function zoomOut() {
  mapInstance?.zoomOut();
}
</script>

<template>
  <div class="zoom-buttons column items-center" style="gap: 8px">
    <q-btn
      class="map-control-btn"
      color="white"
      text-color="primary"
      icon="add"
      title="Zoom in"
      unelevated
      round
      dense
      @click="zoomIn"
    />
    <q-btn
      class="map-control-btn"
      color="white"
      text-color="primary"
      icon="remove"
      title="Zoom out"
      unelevated
      round
      dense
      @click="zoomOut"
    />
  </div>
</template>

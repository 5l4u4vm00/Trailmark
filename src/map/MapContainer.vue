<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { DEFAULT_MAP_KEY, useMap } from "./composables/useMap";
import { useLayers } from "./features/layers/useLayers";
import { useBasemap } from "./features/basemap/useBasemap";

const props = defineProps<{
  /** Map key, defaults to 'main'. For multi-map setups, each map needs its own key. */
  mapKey?: string;
}>();

const containerRef = ref<HTMLDivElement | null>(null);
const mapKey = props.mapKey ?? DEFAULT_MAP_KEY;
const { init, destroy } = useMap(mapKey);
const { initLayers } = useLayers(mapKey);
const { initBasemap } = useBasemap(mapKey);

onMounted(() => {
  if (!containerRef.value) {
    return;
  }
  init(containerRef.value, {
    style: { version: 8, sources: {}, layers: [] },
    center: [121.5654, 25.033],
    zoom: 13,
    attributionControl: false,
  });
  void initBasemap();
  void initLayers();
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<template>
  <div class="map-wrapper">
    <div ref="containerRef" class="map-container"></div>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>

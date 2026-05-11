<script setup lang="ts">
import { ref } from "vue";
import { DEFAULT_MAP_KEY, useMap } from "@/map/composables/useMap";

const props = defineProps<{
  /** Map key, defaults to 'main' */
  mapKey?: string;
}>();

const { onMapReady } = useMap(props.mapKey ?? DEFAULT_MAP_KEY);

/** Current map bearing (degrees) — used to rotate the compass icon */
const bearing = ref(0);

let resetNorth: () => void = () => {};

onMapReady((m) => {
  const sync = () => (bearing.value = m.getBearing());
  sync();
  m.on("rotate", sync);
  resetNorth = () => m.resetNorth();
  return () => m.off("rotate", sync);
});

/**
 * Click the compass to reset rotation back to north.
 */
function onClick() {
  resetNorth();
}
</script>

<template>
  <q-btn
    class="map-control-btn"
    color="white"
    text-color="primary"
    title="Reset rotation"
    unelevated
    round
    dense
    @click="onClick"
  >
    <q-icon
      name="navigation"
      :style="{ transform: `rotate(${-bearing}deg)` }"
    />
  </q-btn>
</template>

<style lang="scss" scoped>
.map-control-btn :deep(.q-icon) {
  transition: transform 0.2s ease-out;
}
</style>

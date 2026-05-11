<script setup lang="ts">
import CompassButton from "./CompassButton.vue";
import LocateButton from "../locate/LocateButton.vue";
import DimensionToggle from "./DimensionToggle.vue";
import ZoomButtons from "./ZoomButtons.vue";

defineProps<{
  /** Map key, defaults to 'main'. Passed through to each control child component. */
  mapKey?: string;
}>();
</script>

<template>
  <div class="map-controls map-overlay column items-center">
    <CompassButton :map-key="mapKey" />
    <LocateButton :map-key="mapKey" />
    <DimensionToggle :map-key="mapKey" />
    <ZoomButtons :map-key="mapKey" />
  </div>
</template>

<style lang="scss" scoped>
.map-controls {
  position: absolute;
  top: 80px;
  right: 16px;
  z-index: var(--map-shell-z-controls);
  gap: 8px;
}

@media (max-width: 767px) {
  .map-controls {
    top: 80px;
    right: 12px;
  }
}
</style>

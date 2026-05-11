<script setup lang="ts">
import { ref } from "vue";
import { DEFAULT_MAP_KEY, useMap } from "@/map/composables/useMap";

const props = defineProps<{
  /** Map key, defaults to 'main' */
  mapKey?: string;
}>();

const { onMapReady } = useMap(props.mapKey ?? DEFAULT_MAP_KEY);

/** Current display mode: 2D locks pitch=0, 3D allows tilt */
const mode = ref<"2D" | "3D">("2D");

const MAX_PITCH_3D = 60;

let setMode: (next: "2D" | "3D") => void = () => {};

onMapReady((m) => {
  // Default to 2D: lock tilt so users can't enter a 3D view via Ctrl+drag
  m.setMaxPitch(0);

  setMode = (next) => {
    if (mode.value === next) {
      return;
    }
    mode.value = next;
    if (next === "3D") {
      m.setMaxPitch(MAX_PITCH_3D);
      m.easeTo({ pitch: MAX_PITCH_3D, duration: 300 });
    } else {
      m.easeTo({ pitch: 0, duration: 300 });
      // Wait for the animation to end before re-locking, so maxPitch=0 doesn't truncate it mid-animation
      m.once("moveend", () => m.setMaxPitch(0));
    }
  };
});
</script>

<template>
  <div class="dimension-toggle column items-center" style="gap: 8px">
    <q-btn
      class="map-control-btn"
      :color="mode === '2D' ? 'primary' : 'white'"
      :text-color="mode === '2D' ? 'white' : 'primary'"
      label="2D"
      title="2D mode"
      unelevated
      round
      dense
      @click="setMode('2D')"
    />
    <q-btn
      class="map-control-btn"
      :color="mode === '3D' ? 'primary' : 'white'"
      :text-color="mode === '3D' ? 'white' : 'primary'"
      label="3D"
      title="3D mode"
      unelevated
      round
      dense
      @click="setMode('3D')"
    />
  </div>
</template>

<style lang="scss" scoped>
.dimension-toggle :deep(.q-btn__content) {
  font-size: 16px;
  font-weight: 700;
}
</style>

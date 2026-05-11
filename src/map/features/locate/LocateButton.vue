<script setup lang="ts">
import { DEFAULT_MAP_KEY } from "@/map/composables/useMap";
import { useLocate } from "./useLocate";

const props = defineProps<{
  /** Map key, defaults to 'main' */
  mapKey?: string;
}>();

const { locate, locating, error } = useLocate(props.mapKey ?? DEFAULT_MAP_KEY);
</script>

<template>
  <q-btn
    class="map-control-btn"
    color="white"
    text-color="primary"
    :icon="locating ? 'hourglass_empty' : 'gps_fixed'"
    :disable="locating"
    :title="error ?? 'Locate current position'"
    unelevated
    round
    dense
    @click="locate()"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ToolPanel from "@/components/layout/ToolPanel.vue";
import { MAP_KEYS } from "@/map/composables/mapKeys";
import { parseDecimal } from "./mapLocateConfig";
import { useMapLocateStore } from "./mapLocateStore";
import { useMapLocate } from "./useMapLocate";

defineEmits(["close"]);

const mapKey = MAP_KEYS.MAIN;
const store = useMapLocateStore();
const locator = useMapLocate(mapKey);

const latInput = computed<string>({
  get: () => store.getCoordInput(mapKey).lat,
  set: (v) =>
    store.setCoordInput(mapKey, { ...store.getCoordInput(mapKey), lat: v }),
});

const lngInput = computed<string>({
  get: () => store.getCoordInput(mapKey).lng,
  set: (v) =>
    store.setCoordInput(mapKey, { ...store.getCoordInput(mapKey), lng: v }),
});

const errorMsg = ref<string | null>(null);

function submitLocate() {
  const lat = parseDecimal(latInput.value);
  const lng = parseDecimal(lngInput.value);
  const result = locator.locate(lat as number, lng as number);
  errorMsg.value = result.ok ? null : result.reason;
}

function reset() {
  errorMsg.value = null;
  locator.reset();
}
</script>

<template>
  <ToolPanel title="Map Locate" @close="$emit('close')">
    <q-form class="q-gutter-sm" @submit.prevent="submitLocate">
      <q-select
        outlined
        dense
        label="Coordinate System"
        :options="['WGS84 Lat/Lng']"
        model-value="WGS84 Lat/Lng"
        readonly
      />
      <q-input
        v-model="latInput"
        outlined
        dense
        label="Latitude"
        placeholder="e.g. 24.8488"
        :error="!!errorMsg"
        hide-bottom-space
      />
      <q-input
        v-model="lngInput"
        outlined
        dense
        label="Longitude"
        placeholder="e.g. 121.8595"
        :error="!!errorMsg"
        :error-message="errorMsg ?? ''"
      />
    </q-form>

    <template #actions>
      <q-btn outline color="primary" label="Reset" @click="reset" />
      <q-btn unelevated color="primary" label="Locate" @click="submitLocate" />
    </template>
  </ToolPanel>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import ToolPanel from "@/components/layout/ToolPanel.vue";
import { MAP_KEYS } from "@/map/composables/mapKeys";
import { Distance } from "./domain/Distance";
import { Area } from "./domain/Area";
import { MAX_MEASUREMENTS } from "./measurementConfig";
import {
  useMeasurementStore,
  type MeasurementMode,
  type MeasurementRow,
} from "./measurementStore";
import { useMeasurement } from "./useMeasurement";

defineEmits(["close"]);

const mapKey = MAP_KEYS.MAIN;
const store = useMeasurementStore();
const m = useMeasurement(mapKey);

onMounted(() => {
  m.startSession();
});
onBeforeUnmount(() => {
  m.endSession();
});

const tab = computed<MeasurementMode>({
  get: () => store.getMode(mapKey),
  set: (v) => m.setMode(v),
});

const rows = computed<MeasurementRow[]>(() => store.getRows(mapKey));
const editingId = computed(() => store.getEditing(mapKey));

const filteredRows = computed(() =>
  rows.value.filter((r) => r.mode === tab.value),
);

const renamingId = ref<string | null>(null);
const renameDraft = ref("");

function startRename(row: MeasurementRow) {
  renamingId.value = row.id;
  renameDraft.value = row.label;
}
function commitRename() {
  if (renamingId.value) {
    m.renameRow(renamingId.value, renameDraft.value.trim() || "Untitled");
  }
  renamingId.value = null;
}

const nf = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatValue(row: MeasurementRow): string {
  if (row.mode === "distance" && row.meters !== undefined) {
    return nf.format(Distance.fromMeters(row.meters).meters);
  }
  if (row.mode === "area" && row.squareMeters !== undefined) {
    return nf.format(Area.fromSquareMeters(row.squareMeters).squareMeters);
  }
  return "—";
}

function unitLabel(mode: MeasurementMode): string {
  return mode === "distance" ? "meters" : "sq meters";
}

function rowIndex(row: MeasurementRow): number {
  return filteredRows.value.findIndex((r) => r.id === row.id) + 1;
}

const atLimit = computed(() => rows.value.length >= MAX_MEASUREMENTS);
</script>

<template>
  <ToolPanel title="Measurement" @close="$emit('close')">
    <template #tabs>
      <q-tabs
        v-model="tab"
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        dense
        no-caps
      >
        <q-tab
          name="distance"
          label="Distance"
          @click="m.setMode('distance')"
        />
        <q-tab name="area" label="Area" @click="m.setMode('area')" />
      </q-tabs>
      <q-separator />
    </template>

    <p class="text-grey-7 text-caption q-mb-sm">
      <span v-if="atLimit">
        Reached {{ MAX_MEASUREMENTS }} measurements. Delete one to add more.
      </span>
      <span v-else-if="editingId">
        Drag vertices to edit. Click <strong>Done</strong> when finished.
      </span>
      <span v-else>
        Click on the map to measure
        {{ tab === "distance" ? "distance" : "area" }};
        {{ tab === "distance" ? "double-click" : "double-click" }} to finish.
      </span>
    </p>

    <div class="q-mb-sm text-right">
      <q-btn
        v-if="editingId"
        dense
        flat
        color="primary"
        label="Done"
        @click="m.finishEdit()"
      />
      <q-btn
        v-else
        dense
        flat
        color="primary"
        icon="add"
        :label="tab === 'distance' ? 'New distance' : 'New area'"
        :disable="atLimit"
        @click="m.setMode(tab)"
      />
    </div>

    <q-list class="measure-list">
      <q-item v-if="filteredRows.length === 0" class="q-px-none">
        <q-item-section class="text-grey-6 text-caption">
          No {{ tab === "distance" ? "distance" : "area" }} measurements yet.
        </q-item-section>
      </q-item>

      <q-item v-for="row in filteredRows" :key="row.id" class="q-px-none">
        <q-item-section side>
          <span class="measure-list__index">{{ rowIndex(row) }}</span>
        </q-item-section>
        <q-item-section side>
          <span
            class="measure-list__color-bar"
            :style="{ background: row.color }"
          />
        </q-item-section>
        <q-item-section>
          <template v-if="renamingId === row.id">
            <q-input
              v-model="renameDraft"
              dense
              borderless
              autofocus
              @blur="commitRename"
              @keyup.enter="commitRename"
              @keyup.esc="renamingId = null"
            />
          </template>
          <template v-else>
            <span
              class="measure-list__label"
              :title="row.label"
              @click="startRename(row)"
            >
              {{ row.label }}
            </span>
            <span class="measure-list__value">{{ formatValue(row) }}</span>
          </template>
        </q-item-section>
        <q-item-section side>
          <span class="text-caption text-grey-7">{{
            unitLabel(row.mode)
          }}</span>
        </q-item-section>
        <q-item-section side>
          <div class="row no-wrap">
            <q-btn
              flat
              dense
              round
              icon="edit_location_alt"
              size="sm"
              :color="editingId === row.id ? 'primary' : 'grey-6'"
              title="Edit vertices"
              @click="
                editingId === row.id
                  ? m.finishEdit()
                  : m.beginEditVertices(row.id)
              "
            />
            <q-btn
              flat
              dense
              round
              icon="delete_outline"
              size="sm"
              color="grey-6"
              title="Delete"
              @click="m.deleteRow(row.id)"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="text-right text-caption text-grey-7 q-mt-xs">
      Total: {{ rows.length }}/{{ MAX_MEASUREMENTS }}
    </div>
  </ToolPanel>
</template>

<style lang="scss" scoped>
.measure-list {
  &__index {
    width: 16px;
    text-align: center;
    color: var(--text-muted);
    font-size: var(--font-size-caption);
  }

  &__color-bar {
    display: inline-block;
    width: 28px;
    height: 4px;
    border-radius: 2px;
  }

  &__label {
    font-size: 12px;
    color: var(--text-muted);
    cursor: text;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__value {
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
}
</style>

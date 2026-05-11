<script setup lang="ts">
import { ref } from "vue";
import ToolPanel from "@/components/layout/ToolPanel.vue";

defineEmits(["close"]);

const tab = ref<"distance" | "area">("distance");

interface MeasureRow {
  index: number;
  color: string;
  value: string;
  unit: string;
}

const rows: MeasureRow[] = [
  { index: 1, color: "#e74c3c", value: "8,519,876.66", unit: "sq meters" },
  { index: 2, color: "#e67e22", value: "8,519,876.66", unit: "sq meters" },
  { index: 3, color: "#f1c40f", value: "8,519,876.66", unit: "sq meters" },
  { index: 4, color: "#2ecc71", value: "8,519,876.66", unit: "sq meters" },
  { index: 5, color: "#1abc9c", value: "8,519,876.66", unit: "sq meters" },
  { index: 6, color: "#3498db", value: "8,519,876.66", unit: "sq meters" },
];
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
        <q-tab name="distance" label="Distance" />
        <q-tab name="area" label="Area" />
      </q-tabs>
      <q-separator />
    </template>

    <p class="text-grey-7 text-caption q-mb-sm">
      Click on the map to measure {{ tab === "distance" ? "distance" : "area" }}
    </p>

    <q-list class="measure-list">
      <q-item v-for="row in rows" :key="row.index" class="q-px-none">
        <q-item-section side>
          <span class="measure-list__index">{{ row.index }}</span>
        </q-item-section>
        <q-item-section side>
          <span
            class="measure-list__color-bar"
            :style="{ background: row.color }"
          />
        </q-item-section>
        <q-item-section>
          <span class="measure-list__value">{{ row.value }}</span>
        </q-item-section>
        <q-item-section side>
          <span class="text-caption text-grey-7">{{ row.unit }}</span>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            dense
            round
            icon="delete_outline"
            size="sm"
            color="grey-6"
            title="Delete"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <div class="text-right text-caption text-grey-7 q-mt-xs">
      Total: {{ rows.length }}/10
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

  &__value {
    font-size: 13px;
    font-variant-numeric: tabular-nums;
  }
}
</style>

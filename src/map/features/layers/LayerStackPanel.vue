<script setup lang="ts">
import { ref } from "vue";
import ToolPanel from "@/components/layout/ToolPanel.vue";

defineEmits(["close"]);

interface LayerItem {
  key: string;
  label: string;
  enabled: boolean;
  opacity: number;
  legendOpen: boolean;
  legend?: { color: string; label: string }[];
}

const layers = ref<LayerItem[]>([
  {
    key: "biodiversity",
    label: "Biodiversity Hotspots",
    enabled: true,
    opacity: 45,
    legendOpen: true,
    legend: [
      { color: "#f4d03f", label: "Level 1" },
      { color: "#e67e22", label: "Level 2" },
      { color: "#d35400", label: "Level 3" },
      { color: "#c0392b", label: "Level 4" },
    ],
  },
  {
    key: "non-urban-land",
    label: "Non-Urban Land Use",
    enabled: false,
    opacity: 0,
    legendOpen: false,
  },
  {
    key: "3d-buildings",
    label: "3D Building Footprints",
    enabled: false,
    opacity: 60,
    legendOpen: false,
  },
  {
    key: "typhoon-path",
    label: "Typhoon Paths",
    enabled: false,
    opacity: 0,
    legendOpen: false,
  },
  {
    key: "road-sign",
    label: "Road Signs",
    enabled: false,
    opacity: 0,
    legendOpen: false,
  },
]);
</script>

<template>
  <ToolPanel title="Layers" @close="$emit('close')">
    <q-list separator>
      <q-item
        v-for="layer in layers"
        :key="layer.key"
        class="layer-item q-px-none"
      >
        <q-item-section>
          <div class="row items-center no-wrap">
            <q-toggle v-model="layer.enabled" color="primary" dense />
            <span class="layer-item__label q-ml-xs">{{ layer.label }}</span>
            <q-icon name="info" size="16px" color="grey-6" class="q-ml-xs" />
            <q-space />
            <q-btn
              :label="layer.legendOpen ? 'Hide legend' : 'Show legend'"
              size="sm"
              outline
              dense
              no-caps
              color="primary"
              @click="layer.legendOpen = !layer.legendOpen"
            />
          </div>

          <div class="row items-center no-wrap q-mt-xs">
            <q-slider
              v-model="layer.opacity"
              :min="0"
              :max="100"
              color="primary"
              dense
              class="col"
            />
            <span class="layer-item__percent q-ml-sm"
              >{{ layer.opacity }}%</span
            >
          </div>

          <div
            v-if="layer.legendOpen && layer.legend?.length"
            class="layer-item__legend row q-mt-xs"
          >
            <div
              v-for="entry in layer.legend"
              :key="entry.label"
              class="row items-center q-mr-md"
            >
              <span
                class="layer-item__swatch"
                :style="{ background: entry.color }"
              />
              <span class="q-ml-xs">{{ entry.label }}</span>
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <template #actions>
      <q-btn outline color="primary" label="Reset" />
      <q-btn unelevated color="primary" label="Apply" />
    </template>
  </ToolPanel>
</template>

<style lang="scss" scoped>
.layer-item {
  &__label {
    font-size: 14px;
    color: var(--text-primary);
  }

  &__percent {
    width: 42px;
    text-align: right;
    font-size: 12px;
    color: var(--text-muted);
  }

  &__legend {
    flex-wrap: wrap;
    font-size: 12px;
  }

  &__swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 2px;
  }
}
</style>

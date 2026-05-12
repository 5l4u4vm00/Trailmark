<script setup lang="ts">
import { ref } from "vue";
import ToolPanel from "@/components/layout/ToolPanel.vue";
import { DEFAULT_MAP_KEY } from "@/map/composables/useMap";
import { useLayers } from "./useLayers";
import { useLayersStore } from "./layersStore";

defineEmits(["close"]);

const mapKey = DEFAULT_MAP_KEY;
const { layers, setVisible, setOpacity, resetAll } = useLayers(mapKey);
const store = useLayersStore();
store.ensureMap(mapKey);

const legendOpen = ref<Record<string, boolean>>(
  Object.fromEntries(layers.map((l) => [l.id, l.id === "osm-trails"])),
);

function toggleLegend(id: string) {
  legendOpen.value[id] = !legendOpen.value[id];
}
</script>

<template>
  <ToolPanel title="Layers" @close="$emit('close')">
    <q-list separator>
      <q-item
        v-for="layer in layers"
        :key="layer.id"
        class="layer-item q-px-none"
      >
        <q-item-section>
          <div class="row items-center no-wrap">
            <q-toggle
              :model-value="store.getState(mapKey, layer.id).visible"
              color="primary"
              dense
              @update:model-value="(v) => setVisible(layer.id, v)"
            />
            <span class="layer-item__label q-ml-xs">{{ layer.name }}</span>
            <q-space />
            <q-btn
              v-if="layer.legend?.length"
              :label="legendOpen[layer.id] ? 'Hide legend' : 'Show legend'"
              size="sm"
              outline
              dense
              no-caps
              color="primary"
              @click="toggleLegend(layer.id)"
            />
          </div>

          <div class="row items-center no-wrap q-mt-xs">
            <q-slider
              :model-value="store.getState(mapKey, layer.id).opacity"
              :min="0"
              :max="100"
              color="primary"
              dense
              class="col"
              @update:model-value="(v) => setOpacity(layer.id, v ?? 0)"
            />
            <span class="layer-item__percent q-ml-sm"
              >{{ store.getState(mapKey, layer.id).opacity }}%</span
            >
          </div>

          <div
            v-if="legendOpen[layer.id] && layer.legend?.length"
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
      <q-btn outline color="primary" label="Reset" @click="resetAll" />
      <q-btn unelevated color="primary" label="Done" @click="$emit('close')" />
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

<script setup lang="ts">
import { computed } from "vue";
import ToolPanel from "@/components/layout/ToolPanel.vue";
import { DEFAULT_MAP_KEY } from "@/map/composables/useMap";
import { useBasemap } from "./useBasemap";
import { useBasemapStore } from "./basemapStore";

const props = defineProps<{
  /** Map key, defaults to 'main' */
  mapKey?: string;
}>();

defineEmits(["close"]);

const mapKey = props.mapKey ?? DEFAULT_MAP_KEY;
const { setBasemap, basemaps } = useBasemap(mapKey);
const store = useBasemapStore();
const currentBasemapKey = computed(() => store.getCurrentBasemap(mapKey));

function handleSelect(key: string): void {
  if (key === currentBasemapKey.value) {
    return;
  }
  void setBasemap(key);
}
</script>

<template>
  <ToolPanel title="Basemap" @close="$emit('close')">
    <div class="basemap-grid">
      <button
        v-for="item in basemaps"
        :key="item.key"
        type="button"
        class="basemap-item column"
        :class="{ 'basemap-item--active': currentBasemapKey === item.key }"
        @click="handleSelect(item.key)"
      >
        <div class="basemap-item__thumb">
          <img v-if="item.thumbnail" :src="item.thumbnail" :alt="item.label" />
          <q-badge
            v-if="currentBasemapKey === item.key"
            class="basemap-item__badge"
            color="primary"
            label="In use"
          />
        </div>
        <span class="basemap-item__label">{{ item.label }}</span>
      </button>
    </div>
  </ToolPanel>
</template>

<style lang="scss" scoped>
.basemap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.basemap-item {
  border: 2px solid transparent;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  transition: border-color 0.15s ease;

  &--active {
    border-color: var(--q-primary);
  }

  &__thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 1.4 / 1;
    background: #e9ecef;
    border-radius: 6px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__badge {
    position: absolute;
    top: 6px;
    left: 6px;
  }

  &__label {
    margin-top: 6px;
    font-size: var(--font-size-caption);
    text-align: center;
    color: var(--text-primary);
  }
}
</style>

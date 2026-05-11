<script setup>
import ToolDockButton from "./ToolDockButton.vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

const tools = [
  { key: "treeQuery", label: "Tree", icon: "search" },
  { key: "mapLocate", label: "Locate", icon: "place" },
  { key: "basemap", label: "Basemap", icon: "menu_book" },
  { key: "layers", label: "Layers", icon: "layers" },
  { key: "measurement", label: "Measure", icon: "straighten" },
];

function toggle(key) {
  emit("update:modelValue", props.modelValue === key ? null : key);
}
</script>

<template>
  <q-card class="tool-dock map-overlay column items-center" flat>
    <ToolDockButton
      v-for="tool in tools"
      :key="tool.key"
      :icon="tool.icon"
      :label="tool.label"
      :active="modelValue === tool.key"
      @click="toggle(tool.key)"
    />
  </q-card>
</template>

<style lang="scss" scoped>
.tool-dock {
  position: absolute;
  top: 80px;
  left: 16px;
  z-index: var(--map-shell-z-toolbar);
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid var(--q-primary);
  border-radius: 8px;
  box-shadow: var(--map-shell-shadow-sm);
  gap: 16px;
}
</style>

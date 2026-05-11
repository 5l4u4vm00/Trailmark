<script setup>
import { ref } from "vue";
import { useQuasar } from "quasar";
import MapHeader from "@/components/layout/MapHeader.vue";
import MainDrawer from "@/components/layout/MainDrawer.vue";
import ToolDock from "./ToolDock.vue";
import MapControls from "@/map/features/controls/MapControls.vue";
import TreeQueryPanel from "@/map/features/treeQuery/TreeQueryPanel.vue";
import MapLocatePanel from "@/map/features/mapLocate/MapLocatePanel.vue";
import BasemapPanel from "@/map/features/basemap/BasemapPanel.vue";
import LayerStackPanel from "@/map/features/layers/LayerStackPanel.vue";
import MeasurePanel from "@/map/features/measurement/MeasurePanel.vue";

const $q = useQuasar();

/** 'treeQuery' | 'mapLocate' | 'basemap' | 'layers' | 'measurement' | null */
const activePanel = ref(null);
const drawerOpen = ref(false);
const navMenuOpen = ref(false);

function handleToggleMenu() {
  // Mobile hamburger → open drawer; desktop/tablet → toggle horizontal nav menu
  if ($q.screen.lt.sm) {
    drawerOpen.value = !drawerOpen.value;
  } else {
    navMenuOpen.value = !navMenuOpen.value;
  }
}

// TODO: decide user event
function handleToggleUser() {}

function closePanel() {
  activePanel.value = null;
}
</script>

<template>
  <div class="map-shell">
    <MapHeader
      :nav-menu-open="navMenuOpen"
      :drawer-open="drawerOpen"
      @toggle-menu="handleToggleMenu"
      @open-user="handleToggleUser"
    />

    <ToolDock
      v-if="!$q.screen.lt.sm"
      v-model="activePanel"
      class="map-overlay"
    />

    <MapControls />

    <div
      v-if="activePanel"
      class="map-shell__panel-slot map-overlay"
      :class="{ 'map-shell__panel-slot--mobile': $q.screen.lt.sm }"
    >
      <TreeQueryPanel v-if="activePanel === 'treeQuery'" @close="closePanel" />
      <MapLocatePanel
        v-else-if="activePanel === 'mapLocate'"
        @close="closePanel"
      />
      <BasemapPanel v-else-if="activePanel === 'basemap'" @close="closePanel" />
      <LayerStackPanel
        v-else-if="activePanel === 'layers'"
        @close="closePanel"
      />
      <MeasurePanel
        v-else-if="activePanel === 'measurement'"
        @close="closePanel"
      />
    </div>

    <MainDrawer v-model="drawerOpen" />
  </div>
</template>

<style lang="scss" scoped>
.map-shell {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;

  &__panel-slot {
    position: absolute;
    top: 80px;
    left: 112px;
    z-index: var(--map-shell-z-panel);

    &--mobile {
      top: auto;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}

@media (max-width: 767px) {
  .map-shell__panel-slot:not(.map-shell__panel-slot--mobile) {
    left: 12px;
    right: 12px;
  }
}
</style>

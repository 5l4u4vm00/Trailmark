<script setup>
import MapContainer from "@/map/MapContainer.vue";
import MapShell from "@/features/mapShell/MapShell.vue";
</script>

<template>
  <MapContainer class="home-map">
    <MapShell />
  </MapContainer>
</template>

<style lang="scss" scoped>
.home-map {
  width: 100%;
  height: 100%;
}
</style>

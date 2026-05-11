<script setup>
import {} from "vue";

const keepAliveProps = defineProps({
  include: [String, RegExp, Array],
  exclude: [String, RegExp, Array],
  max: [Number, String],
});
</script>

<template>
  <router-view v-slot="{ Component }">
    <KeepAlive
      :include="keepAliveProps.include"
      :exclude="keepAliveProps.exclude"
      :max="keepAliveProps.max"
    >
      <component :is="Component" />
    </KeepAlive>
  </router-view>
</template>

<style lang="scss" scoped></style>

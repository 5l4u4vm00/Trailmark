<script setup>
import DrawerGuestPanel from "./DrawerGuestPanel.vue";
import DrawerUserPanel from "./DrawerUserPanel.vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="main-drawer-fade">
      <div v-if="modelValue" class="main-drawer__backdrop" @click="close" />
    </Transition>

    <Transition name="main-drawer-slide">
      <aside v-if="modelValue" class="main-drawer">
        <DrawerUserPanel v-if="store.isLogin" />
        <DrawerGuestPanel v-else />
      </aside>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.main-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  max-width: 90vw;
  background: #fff;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
  z-index: var(--map-shell-z-drawer);

  &__backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: calc(var(--map-shell-z-drawer) - 1);
  }
}

.main-drawer-slide-enter-active,
.main-drawer-slide-leave-active {
  transition: transform 0.25s ease;
}

.main-drawer-slide-enter-from,
.main-drawer-slide-leave-to {
  transform: translateX(100%);
}

.main-drawer-fade-enter-active,
.main-drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.main-drawer-fade-enter-from,
.main-drawer-fade-leave-to {
  opacity: 0;
}
</style>

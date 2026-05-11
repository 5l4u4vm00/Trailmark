<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>

<template>
  <q-btn
    unelevated
    padding="none"
    class="tool-dock-btn column items-center"
    :class="{ 'tool-dock-btn--active': active }"
    @click="$emit('click')"
  >
    <span class="tool-dock-btn__circle">
      <q-icon :name="icon" size="30px" />
    </span>
    <span class="tool-dock-btn__label">{{ label }}</span>
  </q-btn>
</template>

<style lang="scss" scoped>
.tool-dock-btn {
  width: 64px;
  min-width: 64px;
  min-height: auto;
  color: var(--q-primary);

  &__circle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border: 2px solid var(--q-primary);
    border-radius: 50%;
    background: #fff;
    box-shadow: var(--map-shell-shadow);
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  &:hover &__circle {
    background: rgba(7, 130, 121, 0.8);
    border: 2px solid #fff;
    color: #fff;
  }

  &--active &__circle {
    background: var(--q-primary);
    border: 2px solid #fff;
    color: #fff;
  }

  &--active:hover &__circle {
    background: color-mix(in srgb, var(--q-primary) 80%, white);
  }

  &__label {
    margin-top: 4px;
    font-size: var(--font-size-caption);
    line-height: 1.2;
    color: var(--q-primary);
    text-align: center;
    white-space: normal;
    word-break: break-word;
  }
}
</style>

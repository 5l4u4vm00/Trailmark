<script setup>
import { ref, watch } from "vue";
import { useQuasar } from "quasar";

defineProps({
  /** panel title */
  title: {
    type: String,
    required: true,
  },
});

defineEmits(["close"]);

const $q = useQuasar();

const panelRef = ref(null);
const collapsed = ref(false);
const offset = ref({ x: 0, y: 0 });
const isDragging = ref(false);

let dragStart = null;

// Reset drag offset when switching to mobile so the bottom sheet doesn't get shifted
watch(
  () => $q.screen.lt.sm,
  (isMobile) => {
    if (isMobile) {
      offset.value = { x: 0, y: 0 };
    }
  },
);

/**
 * Start dragging
 * @param {PointerEvent} event
 */
function onDragStart(event) {
  // Disable drag on mobile
  if ($q.screen.lt.sm) {
    return;
  }
  // Don't trigger drag when clicking a button
  if (event.target.closest(".q-btn")) {
    return;
  }
  // Left mouse / primary pointer only
  if (event.button !== 0) {
    return;
  }

  // Measure current panel position to calculate movable bounds
  const rect = panelRef.value?.$el?.getBoundingClientRect?.();
  dragStart = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    originX: offset.value.x,
    originY: offset.value.y,
    // Top-left position when no offset is applied
    baseLeft: rect ? rect.left - offset.value.x : 0,
    baseTop: rect ? rect.top - offset.value.y : 0,
    width: rect ? rect.width : 0,
    height: rect ? rect.height : 0,
  };
  isDragging.value = true;

  const target = event.currentTarget;
  target.setPointerCapture(event.pointerId);
  target.addEventListener("pointermove", onDragMove);
  target.addEventListener("pointerup", onDragEnd);
  target.addEventListener("pointercancel", onDragEnd);
  event.preventDefault();
}

/**
 * Drag move
 * @param {PointerEvent} event
 */
function onDragMove(event) {
  if (!dragStart) {
    return;
  }
  const dx = event.clientX - dragStart.pointerX;
  const dy = event.clientY - dragStart.pointerY;
  let nextX = dragStart.originX + dx;
  let nextY = dragStart.originY + dy;

  // Constrain the panel so it stays fully within the viewport (map) bounds
  const minX = -dragStart.baseLeft;
  const maxX = window.innerWidth - dragStart.baseLeft - dragStart.width;
  const minY = -dragStart.baseTop;
  const maxY = window.innerHeight - dragStart.baseTop - dragStart.height;
  nextX = Math.min(Math.max(nextX, minX), maxX);
  nextY = Math.min(Math.max(nextY, minY), maxY);

  offset.value = { x: nextX, y: nextY };
}

/**
 * End dragging
 * @param {PointerEvent} event
 */
function onDragEnd(event) {
  const target = event.currentTarget;
  target.removeEventListener("pointermove", onDragMove);
  target.removeEventListener("pointerup", onDragEnd);
  target.removeEventListener("pointercancel", onDragEnd);
  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId);
  }
  dragStart = null;
  isDragging.value = false;
}
</script>

<template>
  <q-card
    ref="panelRef"
    class="tool-panel"
    :class="{
      'tool-panel--mobile': $q.screen.lt.sm,
      'tool-panel--collapsed': collapsed,
      'tool-panel--dragging': isDragging,
    }"
    :style="
      $q.screen.lt.sm
        ? null
        : { transform: `translate(${offset.x}px, ${offset.y}px)` }
    "
    flat
  >
    <q-card-section
      class="tool-panel__header row items-center justify-between"
      @pointerdown="onDragStart"
    >
      <span class="tool-panel__title">{{ title }}</span>
      <div class="tool-panel__header-actions row items-center no-wrap">
        <q-btn
          flat
          dense
          round
          :icon="collapsed ? 'add' : 'remove'"
          color="primary"
          :title="collapsed ? 'Expand' : 'Collapse'"
          @click="collapsed = !collapsed"
        />
        <q-btn
          flat
          dense
          round
          icon="close"
          color="primary"
          title="Close"
          @click="$emit('close')"
        />
      </div>
    </q-card-section>

    <div v-show="!collapsed" v-if="$slots.tabs" class="tool-panel__tabs">
      <slot name="tabs" />
    </div>

    <q-card-section v-show="!collapsed" class="tool-panel__body">
      <slot />
    </q-card-section>

    <q-card-actions
      v-show="!collapsed"
      v-if="$slots.actions"
      class="tool-panel__actions"
      align="center"
    >
      <slot name="actions" />
    </q-card-actions>
  </q-card>
</template>

<style lang="scss" scoped>
.tool-panel {
  width: 320px;
  max-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 2px solid var(--q-primary);
  pointer-events: auto;

  &--mobile {
    width: 100%;
    max-height: 60vh;
    border-radius: var(--map-shell-radius) var(--map-shell-radius) 0 0;
  }

  &--collapsed {
    max-height: none;
  }

  &--dragging {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
  }

  &__header {
    padding: 12px 16px 8px;
    cursor: move;
    user-select: none;
    touch-action: none;
  }

  &--mobile &__header {
    cursor: default;
    touch-action: auto;
  }

  &__header-actions {
    gap: 4px;
  }

  &__title {
    font-size: var(--font-size-h2);
    font-weight: 700;
    color: var(--text-primary);
  }

  &__tabs {
    padding: 0 16px;
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 16px;
  }

  &__actions {
    padding: 8px 16px 16px;
    gap: 8px;
  }
}
</style>

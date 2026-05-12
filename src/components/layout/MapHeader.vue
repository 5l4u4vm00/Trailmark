<script setup>
import { useQuasar } from "quasar";
import trailmarkLogo from "@/assets/trailmark-logo.svg";

defineEmits(["toggle-menu", "open-user"]);

const $q = useQuasar();
</script>

<template>
  <header class="map-header column items-center map-overlay">
    <div class="map-header__row row items-center no-wrap">
      <q-card class="map-header__brand row items-center no-wrap" flat bordered>
        <div class="map-header__logo row items-center justify-center">
          <img
            :src="trailmarkLogo"
            alt="Trailmark"
            class="map-header__logo-svg"
          />
        </div>
        <span class="map-header__title text-weight-bold"> Trailmark </span>
      </q-card>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.map-header {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--map-shell-z-header);
  pointer-events: auto;

  &__row {
    gap: 8px;
  }

  &__brand {
    height: 56px;
    border-radius: 8px;
    border: 2px solid var(--q-primary);
    background: #fff;
    padding: 0 24px 0 16px;
    box-shadow: var(--map-shell-shadow);
  }

  &__logo {
    flex: 0 0 auto;
    width: 48px;
    height: 32px;
  }

  &__logo-svg {
    width: 100%;
    height: 100%;
  }

  &__title {
    margin-left: 8px;
    font-family: var(--font-family-heading);
    font-size: var(--font-size-h1);
    font-weight: 500;
    color: var(--text-primary);
    letter-spacing: 1px;
    white-space: nowrap;
  }

  &__btn {
    position: relative;
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
    border-radius: 8px;
    border: 2px solid var(--q-primary);
    background: #fff;
    color: var(--q-primary);
    overflow: visible;
    box-shadow: var(--map-shell-shadow);
    transition:
      background 0.15s ease,
      color 0.15s ease;

    :deep(.q-btn__content) {
      overflow: visible;
    }

    &--active {
      background: var(--q-primary);
      color: #fff;
    }
  }

  &__btn-pointer {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid var(--q-primary);
  }
}

@media (max-width: 767px) {
  .map-header {
    left: 12px;
    right: 12px;
    transform: none;
    align-items: stretch;

    &__row {
      width: 100%;
    }

    &__brand {
      flex: 1;
      height: 48px;
      padding: 0 12px;
    }

    &__title {
      font-size: 14px;
      letter-spacing: 0.5px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__btn {
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      border-radius: 12px;
    }

    &__logo {
      width: 36px;
      height: 24px;
    }
  }
}
</style>

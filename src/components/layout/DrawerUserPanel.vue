<script setup>
defineProps({
  /** Display name (including employee ID) */
  displayName: {
    type: String,
    default: "A001 Mr. Wang",
  },
});

const businessItems = [
  { key: "patrol", label: "Maintenance Patrol", icon: "eco" },
  { key: "inventory", label: "Tree Inventory", icon: "park" },
  { key: "admin", label: "Admin", icon: "settings" },
];

const infoItems = [
  { key: "dashboard", label: "Green Carbon Sink Dashboard", icon: "analytics" },
  { key: "announcement", label: "Announcements", icon: "campaign" },
  { key: "download", label: "Document Downloads", icon: "description" },
];
</script>

<template>
  <div class="drawer-user column">
    <div class="drawer-user__banner row items-center q-pa-md">
      <q-avatar size="48px" color="white" text-color="primary" icon="person" />
      <div class="q-ml-md column text-white">
        <span class="text-caption">WELCOME BACK</span>
        <span class="text-h6 text-weight-medium">{{ displayName }}</span>
      </div>
    </div>

    <q-list class="drawer-user__list">
      <q-item v-for="item in businessItems" :key="item.key" v-ripple clickable>
        <q-item-section avatar>
          <q-icon :name="item.icon" color="primary" />
        </q-item-section>
        <q-item-section>{{ item.label }}</q-item-section>
      </q-item>

      <q-separator class="q-my-sm" />

      <q-item v-for="item in infoItems" :key="item.key" v-ripple clickable>
        <q-item-section avatar>
          <q-icon :name="item.icon" color="grey-7" />
        </q-item-section>
        <q-item-section>{{ item.label }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style lang="scss" scoped>
.drawer-user {
  height: 100%;
  background: #fff;

  &__banner {
    background: var(--q-primary);
  }

  &__list {
    padding: 8px 0;
  }
}
</style>

<script setup>
const items = [
  { key: "dashboard", label: "Green Carbon Sink Dashboard", icon: "analytics" },
  { key: "announcement", label: "Announcements", icon: "campaign" },
  { key: "download", label: "Document Downloads", icon: "description" },
];
</script>

<template>
  <div class="drawer-guest column">
    <div class="drawer-guest__banner row items-center q-pa-md">
      <q-avatar size="48px" color="grey-3" text-color="grey-7" icon="person" />
      <div class="q-ml-md column">
        <span class="text-caption text-grey-7">HELLO</span>
        <span class="text-h6 text-weight-medium">Guest</span>
      </div>
    </div>

    <q-list class="drawer-guest__list">
      <q-item v-for="item in items" :key="item.key" v-ripple clickable>
        <q-item-section avatar>
          <q-icon :name="item.icon" color="grey-7" />
        </q-item-section>
        <q-item-section>{{ item.label }}</q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<style lang="scss" scoped>
.drawer-guest {
  height: 100%;
  background: #fff;

  &__banner {
    background: #e9ecef;
  }

  &__list {
    padding: 8px 0;
  }
}
</style>

<script setup lang="ts">
import ToolPanel from "@/components/layout/ToolPanel.vue";

defineEmits(["close"]);
</script>

<template>
  <ToolPanel title="Tree Query" @close="$emit('close')">
    <q-form class="q-gutter-md">
      <q-input outlined dense label="Tree ID" placeholder="Enter tree ID" />
      <q-select
        outlined
        dense
        label="Management District"
        :options="['All']"
        model-value="All"
      />
      <q-select
        outlined
        dense
        label="Species"
        :options="['All']"
        model-value="All"
      />
    </q-form>

    <template #actions>
      <q-btn outline color="primary" label="Reset" />
      <q-btn unelevated color="primary" label="Search" />
    </template>
  </ToolPanel>
</template>

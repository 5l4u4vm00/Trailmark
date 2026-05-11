<script setup lang="ts">
import { ref } from "vue";
import ToolPanel from "@/components/layout/ToolPanel.vue";

defineEmits(["close"]);

const tab = ref<"district" | "mileage" | "coordinate" | "address">("district");
</script>

<template>
  <ToolPanel title="Map Locate" @close="$emit('close')">
    <template #tabs>
      <q-tabs
        v-model="tab"
        class="text-primary"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        dense
        no-caps
      >
        <q-tab name="district" label="District" />
        <q-tab name="mileage" label="Mileage" />
        <q-tab name="coordinate" label="Coordinate" />
        <q-tab name="address" label="Address" />
      </q-tabs>
      <q-separator />
    </template>

    <q-tab-panels v-model="tab" animated class="bg-transparent">
      <q-tab-panel name="district" class="q-pa-none">
        <q-form class="q-gutter-sm">
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
            label="Engineering Section"
            :options="['All']"
            model-value="All"
          />
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="mileage" class="q-pa-none">
        <q-form class="q-gutter-sm">
          <q-select
            outlined
            dense
            label="Provincial Highway"
            :options="['Highway 3']"
            model-value="Highway 3"
          />
          <div class="row q-col-gutter-sm">
            <div class="col">
              <q-input outlined dense label="K (km)" model-value="124" />
            </div>
            <div class="col">
              <q-input outlined dense label="M (meters)" model-value="500" />
            </div>
          </div>
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="coordinate" class="q-pa-none">
        <q-form class="q-gutter-sm">
          <q-select
            outlined
            dense
            label="Coordinate System"
            :options="['WGS84 Lat/Lng']"
            model-value="WGS84 Lat/Lng"
          />
          <q-input outlined dense label="Latitude" model-value="24.8488" />
          <q-input outlined dense label="Longitude" model-value="121.8595" />
        </q-form>
      </q-tab-panel>

      <q-tab-panel name="address" class="q-pa-none">
        <q-form class="q-gutter-sm">
          <q-input
            outlined
            dense
            label="Street Address"
            model-value="Wanhua District, Taipei City"
          />
        </q-form>
      </q-tab-panel>
    </q-tab-panels>

    <template #actions>
      <q-btn outline color="primary" label="Reset" />
      <q-btn unelevated color="primary" label="Locate" />
    </template>
  </ToolPanel>
</template>

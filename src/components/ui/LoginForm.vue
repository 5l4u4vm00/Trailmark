<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "@/store/global";

const router = useRouter();
const store = useGlobalStore();

const username = ref("");
const password = ref("");
const errorMessage = ref("");

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = "Username and password are required.";
    return;
  }

  await store.login();

  await router.push({ name: "Home" });
};
</script>

<template>
  <q-card class="login-form q-pa-lg q-mx-auto" flat bordered>
    <div class="text-h5 q-mb-md">Login</div>
    <q-form class="q-gutter-md" @submit.prevent="handleLogin">
      <q-input
        v-model="username"
        label="Username"
        placeholder="Enter your username"
        outlined
        dense
        autocomplete="username"
        required
      />
      <q-input
        v-model="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        outlined
        dense
        autocomplete="current-password"
        required
      />
      <q-btn
        type="submit"
        label="Login"
        color="primary"
        class="full-width"
        unelevated
      />
    </q-form>
    <div v-if="errorMessage" class="text-negative q-mt-md">
      {{ errorMessage }}
    </div>
  </q-card>
</template>

<style lang="scss" scoped>
.login-form {
  width: 300px;
}
</style>

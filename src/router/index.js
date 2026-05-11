import { createRouter, createWebHistory } from "vue-router";
import { routes } from "@/router/routes/index.js";
import { setPermissionGuard } from "@/router/guards/permission.js";

let router;

if (import.meta.env.DEV) {
  console.log("routes:", routes);
}

export function setupRouter() {
  router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
  });

  setPermissionGuard(router);

  return router;
}

export function getRouter() {
  return router;
}

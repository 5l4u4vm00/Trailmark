import { createApp } from "vue";
import { setupRouter } from "./router";

import { createPinia } from "pinia";
import { Quasar, Screen } from "quasar";
import quasarLang from "quasar/lang/en-US";
import App from "./App.vue";

// styles — maplibre-gl must be loaded before custom styles
import "maplibre-gl/dist/maplibre-gl.css";
// Quasar styles
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";
import "@/styles/app-tokens.scss";
import "@/styles/map-shell.scss";
// import '@/styles/reset.css';

const app = createApp(App);

app.use(setupRouter());

app.use(createPinia());

app.use(Quasar, { plugins: {}, lang: quasarLang });

// Align with design breakpoints: mobile <768, tablet portrait 768–1023, tablet landscape 1024–1279, desktop ≥1280
Screen.setSizes({ sm: 768, md: 1024, lg: 1280, xl: 1920 });

app.mount("#app");

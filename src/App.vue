<script setup></script>

<template>
  <main>
    <router-view />
  </main>
</template>

<style lang="scss">
// Noto Sans TC Regular — self-hosted (other weights/Medium/Bold loaded via CDN in app-tokens.scss)
@font-face {
  font-family: "Noto Sans TC";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src:
    local("Noto Sans TC"),
    url("/fonts/NotoSansTC-Regular.woff2") format("woff2");
}

html,
body,
#app {
  height: 100%;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  min-height: 0;
}
</style>

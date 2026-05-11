import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

const ENV_PATH = "./envs";

export default async ({ mode }) => {
  const basePath = loadEnv(mode, ENV_PATH).VITE_PUBLIC_PATH;

  const devServerConfig = {
    port: 53090,
    strictPort: true,
    https: await getDevCertificate(mode),
    proxy: {
      "/api": {
        target: "https://localhost:55710/api/",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  };

  return defineConfig({
    base: basePath,
    server: devServerConfig,
    build: {
      target: "esnext",
    },
    esbuild: {
      drop: ["debugger"],
      pure: mode.startsWith("Release")
        ? [
            "console.log",
            "console.debug",
            "console.info",
            "console.trace",
            "console.table",
          ]
        : [],
    },
    envDir: ENV_PATH,
    resolve: {
      alias: [{ find: "@", replacement: resolve(__dirname, "src") }],
    },
    plugins: [
      vue({ template: { transformAssetUrls } }),
      quasar({
        sassVariables: resolve(__dirname, "src/styles/quasar-variables.scss"),
      }),
    ],
  });
};

async function getDevCertificate(mode) {
  const isDev = mode === "development";

  if (!isDev) {
    return null;
  }

  // ./scripts/make-certificate.js can be deleted when the mode is not in "development"
  try {
    return (await import("./scripts/make-certificate.js"))?.default();
  } catch (e) {
    throw e;
  }
}

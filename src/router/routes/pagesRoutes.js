import { createRoute } from "@/router/helper/routeHelper.js";

/**
 * Auto-generate convention-based routes from the pages folder, loading .vue
 * components dynamically.
 * @returns
 */
export function generatePagesRoutes() {
  const pageComponents = import.meta.glob(["/src/pages/**/*.vue"], {
    eager: false,
  });
  return createRoute(pageComponents);
}

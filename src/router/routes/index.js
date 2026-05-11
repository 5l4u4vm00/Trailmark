import { noMatchRoute } from "@/router/routes/basicRoutes.js";
import { generatePagesRoutes } from "@/router/routes/pagesRoutes.js";

// Later entries take higher priority
export const routes = [noMatchRoute, ...generatePagesRoutes()];

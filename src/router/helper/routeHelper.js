/**
 * Layout.vue is the container for the routes at this level; it must include
 * <RouterView /> to render its children.
 */
const LAYOUT = "Layout";

/**
 * Home.vue is the default child route component.
 */
const HOME = "Home";

const OK = "OK";
const NOT_IMPL_YET = "Not implemented yet";
const ROOT_PAGE_NOT_FOUND =
  "Could not find /page/Home.vue or /page/Home/Layout.vue";

let _routeStatus = {
  Home: ROOT_PAGE_NOT_FOUND,
};

/**
 * Build vue-router routes from the pages folder.
 * @param {Object} pageComponents
 * @returns
 */
export function createRoute(pageComponents) {
  const pagesRoutes = [];
  Object.keys(pageComponents).forEach((filePath) => {
    const routePath = computeRoutePath(filePath);

    // Iteratively build the route config
    routePath
      .split("/")
      .reduce(createRouteReducer(filePath, pageComponents), pagesRoutes);
  });

  // Route paths should start with a "/"
  pagesRoutes.map((route) => {
    route.path = "/" + route.path;
    return route;
  });

  if (import.meta.env.DEV) {
    checkRouteStatus();
  }

  return pagesRoutes;
}

/**
 * Convert a file path into a route path.
 * @param {String} filePath
 * @returns
 */
function computeRoutePath(filePath) {
  return (
    filePath
      // Strip src/pages
      .replace("/src/pages/", "")
      // Strip LAYOUT.vue
      .replace(`/${LAYOUT}.vue`, "")
      // Strip .vue
      .replace(/.vue/, "")
      // Convert dynamic routes [foo]/[bar] => /:foo/:bar
      .replace(/\[([\w-]+)]/g, ":$1")
  );
}

/**
 * Take a filePath and return a Reduce callback.
 * @param {String} filePath
 * @param {Object} pageComponents
 * @returns
 */
function createRouteReducer(filePath, pageComponents) {
  return (
    routeChildren, // Children array of the current route node
    currentPathName, // Name of the current-level route (the element currently being reduced)
    currentPathIndex, // Index of the current level
    routePathList, // Original list of route segments for the file (routePath.split("/"))
  ) => {
    const routeName = routePathList.slice(0, currentPathIndex + 1).join("-");

    let config = routeChildren.find((child) => child.name === routeName);

    // If the route config for this node hasn't been created, initialise a stub
    // and let later iterations fill in the missing fields.
    if (!config) {
      _routeStatus[routeName] = NOT_IMPL_YET;

      config = {
        name: routeName,
        path: null,
        component: null,
        children: [],
        meta: {},
        props: true, // For dynamic routes, set props=true so route.params is available as props
      };

      routeChildren.push(config);
    }

    // On the final node, fill in the remaining config.
    if (currentPathIndex === routePathList.length - 1) {
      config.path = currentPathName === HOME ? "" : currentPathName;
      config.component = pageComponents[filePath];
      // config.meta.permission = getPermission(config.component);

      _routeStatus[routeName] = OK;
    }

    return config.children;
  };
}

function getPermission(component) {
  if (!component?.permission) {
    throw new Error(`
      Please add permission settings in ${component.__file}
      <script>
        // declare additional options
        export default {
          permissions: ["role1", "role2"]
        }
      </script>
    `);
  }

  return component.permission;
}

/**
 * Verify every route config was created correctly.
 */
function checkRouteStatus() {
  const errorMsg = Object.entries(_routeStatus).reduce(
    (accumulator, currentValue) => {
      if (currentValue[1] == NOT_IMPL_YET) {
        accumulator.push(
          `Could not find a matching ${LAYOUT}.vue for ${currentValue[0]}.`,
        );
      } else if (currentValue[1] == ROOT_PAGE_NOT_FOUND) {
        accumulator.push(ROOT_PAGE_NOT_FOUND);
      }

      return accumulator;
    },
    [],
  );

  if (errorMsg.length) {
    console.group("Build vue-router routes from the pages folder");
    throw new Error(`Failed to build pages router.\n${errorMsg.join("\n")}`);
  } else {
    console.groupCollapsed("Build vue-router routes from the pages folder");
    console.table(_routeStatus);
  }
  console.groupEnd();
}

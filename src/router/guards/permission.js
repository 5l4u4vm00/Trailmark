const whiteList = ["login", "404"];

export function setPermissionGuard(router) {
  router.beforeEach(async (to) => {
    if (isWhiteList(to)) return true;

    return true;
  });
}

function isWhiteList(to) {
  return whiteList.indexOf(to.path) !== -1 || whiteList.indexOf(to.name) !== -1;
}

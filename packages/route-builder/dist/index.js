// packages/route-builder/src/lib/build-routes.ts
var buildRoutes = (r, prefix) => {
  return _buildRoutes(r, prefix);
};
function _buildRoutes(r, prefix = "", first = true) {
  if (typeof r === "string") {
    return `${prefix}${r}`;
  }
  if (typeof r === "function") {
    const f = r;
    return ((...args) => buildRoutes(f(...args), prefix, false));
  }
  if (typeof r === "object") {
    const newObj = {};
    let currentPrefix = prefix;
    if ("$" in r && typeof r["$"] === "string") {
      currentPrefix += r["$"];
    }
    for (const key in r) {
      if (key === "$" && typeof r["$"] === "string") {
        newObj["$"] = currentPrefix;
      } else {
        if (first && currentPrefix === "/") {
          newObj[key] = buildRoutes(r[key], "", false);
        } else {
          newObj[key] = buildRoutes(r[key], currentPrefix, false);
        }
      }
    }
    return newObj;
  }
  return r;
}
export {
  buildRoutes
};

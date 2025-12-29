import {
  PathGenerator,
  PathLiteral,
  ResolvedRoutes,
  RouteMap,
  ValidatePath,
  ValidRouteMap,
  YOLO,
} from './types';

/**
 * Recursively builds callable, typesafe, routes from a RouteMap, prepending
 * prefixes as it goes. Type hints are preserved throughout.
 *
 * Recommended to use defineRoutes first to ensure the RouteMap is valid.
 *
 * @param r - The RouteMap or string to build routes from.
 * @param prefix - The prefix to prepend to each route. (not included in type hints!)
 * @returns The built routes with prefixes applied.
 *
 * @example
 * const routes = {
 *   $: '/',
 *   user: {
 *     $: '/users',
 *     id: (userId: string) => `/${userId}`,
 *   },
 * } satisfies RouteMap;
 *
 * const builtRoutes = buildRoutes(routes);
 *
 * const foo = routes.users.id('123'); // returns "/users/123", type hint is "/users/{string}"
 *
 * @example
 * const routesWithPrefix = {
 *   $: '/',
 *   about: '/about',
 * } satisfies RouteMap;
 *
 * const builtRoutesWithPrefix = buildRoutes(routesWithPrefix, 'http://example.com');
 *
 * const aboutUrl = routesWithPrefix.about; // returns "http://example.com/about", type hint is "/about"
 *
 * @example
 * const validatedRoutes = buildRoutes(
 *   defineRoutes({
 *     $: '/',
 *     contact: '/contact',
 *   })
 * );
 *
 * const contactUrl = validatedRoutes.contact; // returns "/contact", type hint is "/contact"
 */
export const buildRoutes: typeof _buildRoutes = (r, prefix) => {
  return _buildRoutes(r, prefix);
};

function _buildRoutes<
  const T extends RouteMap | PathLiteral,
  Prefix extends string = '',
  // >(r: ValidRouteMap<T>, prefix = '') {
>(
  r: T extends string ? ValidatePath<T> : ValidRouteMap<T>,
  prefix = '',
  first = true
) {
  if (typeof r === 'string') {
    return `${prefix}${r}` as ResolvedRoutes<T, Prefix>;
  }
  if (typeof r === 'function') {
    const f = r as PathGenerator;
    return ((...args: YOLO[]) =>
      buildRoutes(f(...args), prefix, false)) as unknown as ResolvedRoutes<
      T,
      Prefix
    >;
  }
  if (typeof r === 'object') {
    const newObj = {} as YOLO;
    let currentPrefix = prefix;

    // Make sure we always handle $ before going through the keys
    if ('$' in r && typeof r['$'] === 'string') {
      currentPrefix += r['$'];
    }

    for (const key in r) {
      if (key === '$' && typeof r['$'] === 'string') {
        newObj['$'] = currentPrefix;
      } else {
        if (first && currentPrefix === '/') {
          // Prevent double-slash at beginning when first $ is '/'
          newObj[key] = buildRoutes(r[key] as RouteMap, '', false);
        } else {
          newObj[key] = buildRoutes(r[key] as RouteMap, currentPrefix, false);
        }
      }
    }
    return newObj as ResolvedRoutes<T, Prefix>;
  }
  return r as unknown as ResolvedRoutes<T, Prefix>;
}

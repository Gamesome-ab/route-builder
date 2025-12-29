import { PathLiteral, ResolvedRoutes, RouteMap, ValidatePath, ValidRouteMap } from './types';
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
export declare const buildRoutes: typeof _buildRoutes;
declare function _buildRoutes<const T extends RouteMap | PathLiteral, Prefix extends string = ''>(r: T extends string ? ValidatePath<T> : ValidRouteMap<T>, prefix?: string, first?: boolean): ResolvedRoutes<T, Prefix>;
export {};
//# sourceMappingURL=build-routes.d.ts.map
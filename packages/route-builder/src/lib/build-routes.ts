import {
	BaseUrl,
	PathGenerator,
	PathLiteral,
	ResolvedRoutes,
	RouteMap,
	ValidatePath, // TODO: remove
	ValidRouteMap,
	YOLO,
} from './types';

type BaseUrlConfig = {
	baseUrl: string;
	/**
	 * If true, the full URL will be included in type hints.
	 * Default is false, meaning only a placeholder `baseUrl` will be included
	 * in type hints. This is likely what you want for most use-cases, as it
	 * likely comes from a dynamic source at runtime and/or just makes the
	 * type hints unreadable.
	 */
	includeFullInTypeHints?: boolean;
};

/**
 * Recursively builds callable, typesafe, routes from a RouteMap, prepending
 * prefixes as it goes. Type hints are preserved throughout.
 *
 * For best type hinting, it's recommended to not declare routes as `const`, but
 * rather inline the object. You can use `satisfies RouteMap`, but this type does
 * not saisfy all the requirements for a RouteMap.
 *
 * @param r - The RouteMap or string to build routes from.
 * @param prefix - The prefix to prepend to each route. (not included in type hints!)
 * @returns The built routes with prefixes applied.
 *
 * @example
 * const builtRoutes = buildRoutes({
 *   $: '/',
 *   user: {
 *     $: '/users',
 *     id: (userId: string) => `/${userId}`,
 *   },
 * });
 *
 * const foo = routes.users.id('123'); // returns "/users/123", type hint is "/users/{string}"
 *
 * @example
 * const routesWithPrefix = buildRoutes({
 *   $: '/',
 *   about: '/about',
 * }, 'http://example.com');
 *
 * const aboutUrl = routesWithPrefix.about; // returns "http://example.com/about", type hint is "/about"
 */
// export function buildRoutes<T extends RouteMap>(
// 	r: ValidRouteMap<T> extends never ? never : T,
// 	baseUrlConfig: BaseUrlConfig = {}
// ) {
// 	return _buildRoutes(r, baseUrlConfig.baseUrl || '');
// }

export function buildRoutes<const T extends RouteMap>(
	r: T extends PathLiteral ? ValidatePath<T> : ValidRouteMap<T>
): ResolvedRoutes<T>;

export function buildRoutes<
	const T extends RouteMap,
	const B extends BaseUrlConfig,
>(
	r: T extends PathLiteral ? ValidatePath<T> : ValidRouteMap<T>,
	baseUrlConfig: B
): ResolvedRoutes<
	T,
	'',
	B extends { includeFullInTypeHints: true }
		? B extends { baseUrl: infer U extends string }
			? U
			: never
		: BaseUrl
>;

export function buildRoutes<const T extends RouteMap>(
	r: T extends PathLiteral ? ValidatePath<T> : ValidRouteMap<T>,
	baseUrlConfig?: BaseUrlConfig
) {
	return _buildRoutes(r, '', baseUrlConfig?.baseUrl, true);
}

export function _buildRoutes<const T extends RouteMap | PathLiteral>(
	r: T extends PathLiteral ? ValidatePath<T> : ValidRouteMap<T>,
	prefix = '',
	baseUrl = '',
	first = false
) {
	if (typeof r === 'string') {
		return `${baseUrl}${prefix}${r}` as ResolvedRoutes<T>;
	}
	if (typeof r === 'function') {
		const f = r as PathGenerator;
		return ((...args: YOLO[]) =>
			_buildRoutes(
				f(...args),
				baseUrl + prefix
			)) as unknown as ResolvedRoutes<T>;
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
				newObj['$'] = baseUrl + currentPrefix;
			} else {
				newObj[key] = _buildRoutes(
					r[key] as RouteMap,
					first && currentPrefix === '/' ? baseUrl : baseUrl + currentPrefix
				);
			}
		}
		return newObj as ResolvedRoutes<T>;
	}
	return r as unknown as ResolvedRoutes<T>;
}

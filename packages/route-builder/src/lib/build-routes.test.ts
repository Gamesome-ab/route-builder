/* eslint-disable @typescript-eslint/no-unused-vars */
import { buildRoutes, _buildRoutes } from './build-routes';
import type { BaseUrl, Equal } from './types';

type Expect<T extends true> = T;

describe('_buildRoutes (string)', () => {
	it('should build route from a string', () => {
		const result = _buildRoutes('/simple');

		expect(result).toBe('/simple');

		type _R = Expect<Equal<typeof result, '/simple'>>;
	});

	it('should build route from a string with a baseUrl', () => {
		const baseUrl = 'http://base-url.com';
		const result = _buildRoutes('/simple', baseUrl);

		expect(result).toBe('http://base-url.com/simple');

		type _R = Expect<Equal<typeof result, '/simple'>>;
	});

	it('should TS error when building route from an empty string', () => {
		// @ts-expect-error - testing invalid route
		const result = _buildRoutes('');
	});

	it('should TS error when building route from string not starting with /', () => {
		// @ts-expect-error - testing invalid route
		const result = _buildRoutes('simple');
	});

	it('should TS error when building route from string ending in /', () => {
		// @ts-expect-error - testing invalid route
		const result = _buildRoutes('simple/');
	});

	it('should TS error when building route from string starting and ending in /', () => {
		// @ts-expect-error - testing invalid route
		const result = _buildRoutes('/simple/');
	});
});

describe('buildRoutes (simple object)', () => {
	it('should build routes from a simple routeMap', () => {
		const result = buildRoutes({
			$: '/',
			non$: '/non-$',
			branch1: {
				$: '/branch-1',
				branch11: {
					$: '/branch-1-1',
				},
			},
		});

		expect(result.$).toBe('/');
		expect(result.non$).toBe('/non-$');
		expect(result.branch1.$).toBe('/branch-1');
		expect(result.branch1.branch11.$).toBe('/branch-1/branch-1-1');

		type _$ = Expect<Equal<typeof result.$, '/'>>;
		type _Non$ = Expect<Equal<typeof result.non$, '/non-$'>>;
		type _Branch1 = Expect<Equal<typeof result.branch1.$, '/branch-1'>>;
		type _Branch11 = Expect<
			Equal<typeof result.branch1.branch11.$, '/branch-1/branch-1-1'>
		>;
	});

	it('should build routes with short type-hints from a routeMap with baseUrl', () => {
		const baseUrl = 'http://base-url.com';

		const result = buildRoutes(
			{
				$: '/',
				non$: '/non-$',
				branch1: {
					$: '/branch-1',
				},
				branch2: {
					$: '/branch-2',
					branch21: {
						$: '/branch-2-1',
					},
				},
			},
			{ baseUrl }
		);
		expect(result.$).toBe('http://base-url.com/');
		expect(result.non$).toBe('http://base-url.com/non-$');
		expect(result.branch1.$).toBe('http://base-url.com/branch-1');
		expect(result.branch2.$).toBe('http://base-url.com/branch-2');
		expect(result.branch2.branch21.$).toBe(
			'http://base-url.com/branch-2/branch-2-1'
		);

		type _$ = Expect<Equal<typeof result.$, `${BaseUrl}/`>>;
		type _Non$ = Expect<Equal<typeof result.non$, `${BaseUrl}/non-$`>>;
		type _Branch1 = Expect<
			Equal<typeof result.branch1.$, `${BaseUrl}/branch-1`>
		>;
		type _Branch2 = Expect<
			Equal<typeof result.branch2.$, `${BaseUrl}/branch-2`>
		>;
		type _Branch21 = Expect<
			Equal<typeof result.branch2.branch21.$, `${BaseUrl}/branch-2/branch-2-1`>
		>;
	});
	it('should build routes with full type-hints from a routeMap with baseUrl', () => {
		const baseUrl = 'http://base-url.com';

		const result = buildRoutes(
			{
				$: '/',
				non$: '/non-$',
				branch1: {
					$: '/branch-1',
				},
				branch2: {
					$: '/branch-2',
					branch21: {
						$: '/branch-2-1',
					},
				},
			},
			{ baseUrl, includeFullInTypeHints: true }
		);
		expect(result.$).toBe('http://base-url.com/');
		expect(result.non$).toBe('http://base-url.com/non-$');
		expect(result.branch1.$).toBe('http://base-url.com/branch-1');
		expect(result.branch2.$).toBe('http://base-url.com/branch-2');
		expect(result.branch2.branch21.$).toBe(
			'http://base-url.com/branch-2/branch-2-1'
		);

		type _$ = Expect<Equal<typeof result.$, `http://base-url.com/`>>;
		type _Non$ = Expect<Equal<typeof result.non$, `http://base-url.com/non-$`>>;
		type _Branch1 = Expect<
			Equal<typeof result.branch1.$, `http://base-url.com/branch-1`>
		>;
		type _Branch2 = Expect<
			Equal<typeof result.branch2.$, `http://base-url.com/branch-2`>
		>;
		type _Branch21 = Expect<
			Equal<
				typeof result.branch2.branch21.$,
				`http://base-url.com/branch-2/branch-2-1`
			>
		>;
	});

	it('should TS error when flat routeMap ends in slash', () => {
		const result = buildRoutes({
			// @ts-expect-error - testing invalid routeMap
			$: '/base/',
		});
	});

	it('should TS error when nested routeMap ends in slash', () => {
		const result = buildRoutes({
			$: '/base',
			branch1: {
				// @ts-expect-error - testing invalid routeMap
				$: '/branch-1/',
			},
		});
	});

	it('should TS error when several parts of nested routeMap ends in slash', () => {
		const result = buildRoutes({
			// @ts-expect-error - testing invalid routeMap
			$: '/base/',
			branch1: {
				// @ts-expect-error - testing invalid routeMap
				$: '/branch-1/',
			},
		});
	});

	it('should TS error with empty paths (or just slash)', () => {
		const result = buildRoutes({
			$: '/',
			// @ts-expect-error - testing invalid routeMap
			non$: '/non-$/',
			branch1: {
				// @ts-expect-error - testing invalid routeMap
				$: '/',
			},
		});

		const result2 = buildRoutes({
			// @ts-expect-error - testing invalid routeMap
			$: '',
			non$: '/non-$/', // <- ideally this would also error, but TS shows only the first
			branch1: {
				// @ts-expect-error - testing invalid routeMap
				$: '',
			},
		});
	});
});

describe('buildRoutes (functions)', () => {
	it('should build routes from a function', () => {
		const result = buildRoutes({ id: (id: string) => `/item/${id}` });

		expect(result.id('123')).toBe('/item/123');

		type _Id = Expect<Equal<ReturnType<typeof result.id>, `/item/${string}`>>;
	});

	it('should build routes from a function with short baseUrl', () => {
		const baseUrl = 'http://base-url.com';

		const result = buildRoutes(
			{ id: (id: string) => `/item/${id}` },
			{ baseUrl }
		);

		expect(result.id('123')).toBe('http://base-url.com/item/123');

		type _Id = Expect<
			Equal<ReturnType<typeof result.id>, `${BaseUrl}/item/${string}`>
		>;
	});

	it('should build routes from a function with full baseUrl', () => {
		const baseUrl = 'http://base-url.com';

		const result = buildRoutes(
			{ id: (id: string) => `/item/${id}` },
			{ baseUrl, includeFullInTypeHints: true }
		);

		expect(result.id('123')).toBe('http://base-url.com/item/123');

		type _Id = Expect<
			Equal<ReturnType<typeof result.id>, `http://base-url.com/item/${string}`>
		>;
	});

	it('should build handle branded strings', () => {
		type ItemId = string & { __brand: 'ItemId' };

		const result = buildRoutes({ id: (id: string) => `/item/${id as ItemId}` });

		expect(result.id('123')).toBe('/item/123');

		type _Id = Expect<Equal<ReturnType<typeof result.id>, `/item/${ItemId}`>>;
	});

	it('should build with multiple arguments', () => {
		type ItemId = string & { __brand: 'ItemId' };

		const result = buildRoutes({
			id: (id: string, scope: string) => `/item/${id as ItemId}/${scope}`,
		});

		expect(result.id('123', 'scope')).toBe('/item/123/scope');

		type _Id = Expect<
			Equal<ReturnType<typeof result.id>, `/item/${ItemId}/${string}`>
		>;
	});

	it('should build with object as argument', () => {
		type ItemId = string & { __brand: 'ItemId' };

		const result = buildRoutes({
			id: (params: { id: string; scope: string }) =>
				`/item/${params.id as ItemId}/${params.scope}`,
		});

		expect(result.id({ id: '123', scope: 'some-scope' })).toBe(
			'/item/123/some-scope'
		);

		type _Id = Expect<
			Equal<ReturnType<typeof result.id>, `/item/${ItemId}/${string}`>
		>;
	});

	it('should build routes with nested functions', () => {
		type ItemId = string & { __brand: 'ItemId' };

		const result = buildRoutes({
			id: (id: string) => `/id/${id}`,
			nested: {
				item: (itemId: string) => `/nested/${itemId as ItemId}`,
			},
		});

		expect(result.id('123')).toBe('/id/123');
		expect(result.nested.item('456')).toBe('/nested/456');

		type _Id = Expect<Equal<ReturnType<typeof result.id>, `/id/${string}`>>;
		type _NestedItem = Expect<
			Equal<ReturnType<typeof result.nested.item>, `/nested/${ItemId}`>
		>;
	});

	it('should build routes with $ and nested functions', () => {
		type ItemId = string & { __brand: 'ItemId' };

		const result = buildRoutes({
			$: '/base',
			id: (id: string) => `/${id}`,
			nested: {
				$: '/nested',
				item: (itemId: string) => `/${itemId as ItemId}`,
			},
		});

		expect(result.$).toBe('/base');
		expect(result.id('123')).toBe('/base/123');
		expect(result.nested.$).toBe('/base/nested');
		expect(result.nested.item('456')).toBe('/base/nested/456');

		type _$ = Expect<Equal<typeof result.$, '/base'>>;
		type _Id = Expect<Equal<ReturnType<typeof result.id>, `/base/${string}`>>;
		type _NestedRoot = Expect<Equal<typeof result.nested.$, '/base/nested'>>;
		type _NestedItem = Expect<
			Equal<ReturnType<typeof result.nested.item>, `/base/nested/${ItemId}`>
		>;
	});

	it('should build routes with $, nested functions and short baseUrl', () => {
		type ItemId = string & { __brand: 'ItemId' };

		const baseUrl = 'http://base-url.com';

		const result = buildRoutes(
			{
				$: '/base',
				id: (id: string) => `/${id}`,
				nested: {
					$: '/nested',
					item: (itemId: string) => `/${itemId as ItemId}`,
				},
			},
			{ baseUrl }
		);

		expect(result.$).toBe('http://base-url.com/base');
		expect(result.id('123')).toBe('http://base-url.com/base/123');
		expect(result.nested.$).toBe('http://base-url.com/base/nested');
		expect(result.nested.item('456')).toBe(
			'http://base-url.com/base/nested/456'
		);

		type _$ = Expect<Equal<typeof result.$, `${BaseUrl}/base`>>;
		type _Id = Expect<
			Equal<ReturnType<typeof result.id>, `${BaseUrl}/base/${string}`>
		>;
		type _NestedRoot = Expect<
			Equal<typeof result.nested.$, `${BaseUrl}/base/nested`>
		>;
		type _NestedItem = Expect<
			Equal<
				ReturnType<typeof result.nested.item>,
				`${BaseUrl}/base/nested/${ItemId}`
			>
		>;
	});

	it('should build routes with $, nested functions and full baseUrl', () => {
		type ItemId = string & { __brand: 'ItemId' };

		const baseUrl = 'http://base-url.com';

		const result = buildRoutes(
			{
				$: '/base',
				id: (id: string) => `/${id}`,
				nested: {
					$: '/nested',
					item: (itemId: string) => `/${itemId as ItemId}`,
				},
			},
			{ baseUrl, includeFullInTypeHints: true }
		);

		expect(result.$).toBe('http://base-url.com/base');
		expect(result.id('123')).toBe('http://base-url.com/base/123');
		expect(result.nested.$).toBe('http://base-url.com/base/nested');
		expect(result.nested.item('456')).toBe(
			'http://base-url.com/base/nested/456'
		);

		type _$ = Expect<Equal<typeof result.$, `http://base-url.com/base`>>;
		type _Id = Expect<
			Equal<ReturnType<typeof result.id>, `http://base-url.com/base/${string}`>
		>;
		type _NestedRoot = Expect<
			Equal<typeof result.nested.$, `http://base-url.com/base/nested`>
		>;
		type _NestedItem = Expect<
			Equal<
				ReturnType<typeof result.nested.item>,
				`http://base-url.com/base/nested/${ItemId}`
			>
		>;
	});

	it('should TS error when function route returns without leading slash', () => {
		const result = buildRoutes({
			// @ts-expect-error - testing invalid route
			id: (id: string) => `item/${id}`, // Missing leading slash
		});
	});

	it('should TS error when function route returns with trailing slash', () => {
		const result = buildRoutes({
			// @ts-expect-error - testing invalid route
			id: (id: string) => `/item/${id}/`, // Trailing slash
		});
	});
});

describe('buildRoutes (deeply nested)', () => {
	it('should build deeply nested routes', () => {
		const result = buildRoutes({
			$: '/base',
			branch1: {
				$: '/branch-1',
				id: (id: string) => `/${id}`,
			},
			branch2: {
				$: '/branch-2',
				branch21: {
					$: '/branch-2-1',
					branch211: {
						$: '/branch-2-1-1',
						branch2111: {
							$: '/branch-2-1-1-1',
							branch21111: {
								$: '/branch-2-1-1-1-1',
								id: (id: string) => `/${id}`,
								filter: (filter: string) => {
									const addedFilter = `some-filter=${filter}`;
									return `?${addedFilter}`;
								},
							},
						},
					},
				},
			},
		});

		type _NotRoot =
			// @ts-expect-error - make sure our type-checkers are working
			Expect<Equal<typeof result.$, '/not-root'>>;

		expect(result.$).toBe('/base');
		type _$ = Expect<Equal<typeof result.$, '/base'>>;

		expect(result.branch1.$).toBe('/base/branch-1');
		type _ItemRoot = Expect<Equal<typeof result.branch1.$, '/base/branch-1'>>;

		expect(result.branch1.id('123')).toBe('/base/branch-1/123');
		type _ItemId = Expect<
			Equal<ReturnType<typeof result.branch1.id>, `/base/branch-1/${string}`>
		>;

		expect(result.branch2.$).toBe('/base/branch-2');
		type _SubItemRoot = Expect<
			Equal<typeof result.branch2.$, '/base/branch-2'>
		>;

		expect(result.branch2.branch21.$).toBe('/base/branch-2/branch-2-1');
		type _SubItemTwoRoot = Expect<
			Equal<typeof result.branch2.branch21.$, '/base/branch-2/branch-2-1'>
		>;

		expect(result.branch2.branch21.branch211.$).toBe(
			'/base/branch-2/branch-2-1/branch-2-1-1'
		);
		type _SubItemThreeRoot = Expect<
			Equal<
				typeof result.branch2.branch21.branch211.$,
				'/base/branch-2/branch-2-1/branch-2-1-1'
			>
		>;

		expect(result.branch2.branch21.branch211.branch2111.$).toBe(
			'/base/branch-2/branch-2-1/branch-2-1-1/branch-2-1-1-1'
		);
		type _SubItemFourRoot = Expect<
			Equal<
				typeof result.branch2.branch21.branch211.branch2111.$,
				'/base/branch-2/branch-2-1/branch-2-1-1/branch-2-1-1-1'
			>
		>;

		expect(result.branch2.branch21.branch211.branch2111.branch21111.$).toBe(
			'/base/branch-2/branch-2-1/branch-2-1-1/branch-2-1-1-1/branch-2-1-1-1-1'
		);
		type _SubItemFiveRoot = Expect<
			Equal<
				typeof result.branch2.branch21.branch211.branch2111.branch21111.$,
				'/base/branch-2/branch-2-1/branch-2-1-1/branch-2-1-1-1/branch-2-1-1-1-1'
			>
		>;

		expect(
			result.branch2.branch21.branch211.branch2111.branch21111.id('123')
		).toBe(
			'/base/branch-2/branch-2-1/branch-2-1-1/branch-2-1-1-1/branch-2-1-1-1-1/123'
		);
		type _SubItemFiveId = Expect<
			Equal<
				ReturnType<
					typeof result.branch2.branch21.branch211.branch2111.branch21111.id
				>,
				`/base/branch-2/branch-2-1/branch-2-1-1/branch-2-1-1-1/branch-2-1-1-1-1/${string}`
			>
		>;

		expect(
			result.branch2.branch21.branch211.branch2111.branch21111.filter('filter')
		).toBe(
			'/base/branch-2/branch-2-1/branch-2-1-1/branch-2-1-1-1/branch-2-1-1-1-1?some-filter=filter'
		);
		type _SubItemFiveFilter = Expect<
			Equal<
				ReturnType<
					typeof result.branch2.branch21.branch211.branch2111.branch21111.filter
				>,
				`/base/branch-2/branch-2-1/branch-2-1-1/branch-2-1-1-1/branch-2-1-1-1-1?${string}`
			>
		>;
	});
});

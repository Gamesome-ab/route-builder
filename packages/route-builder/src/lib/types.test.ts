/* eslint-disable @typescript-eslint/no-unused-vars */
import { Expect, Equal } from './test-utils';
import {
	PathGenerator,
	PathLiteral,
	RouteMap,
	ValidatePath,
	ValidRouteMap,
} from './types';

describe('PathLiteral', () => {
	it('should allow just a slash', () => {
		const result: PathLiteral = '/';
	});

	it('should allow strings starting with a slash', () => {
		const result: PathLiteral = '/example';
	});

	it('should allow nested paths', () => {
		const result: PathLiteral = '/example/nested';
	});

	it('should not allow strings with trailing slash', () => {
		// @ts-expect-error - should not allow trailing slash
		const result: PathLiteral = 'nested/';
	});

	it('should (unfortunately) allow strings with trailing slash if they also have leading slash', () => {
		const result: PathLiteral = '/nested/';
	});

	it('should allow hash paths', () => {
		const result: PathLiteral = '#section1';
	});

	it('should allow query paths', () => {
		const result: PathLiteral = '?search=query';
	});
});

describe('PathGenerator', () => {
	it('should allow generators that return PathLiteral', () => {
		const result: PathGenerator = (id: string) => `/${id}`;
	});

	it('should allow generators with multiple parameters', () => {
		const result: PathGenerator = (category: string, id: string) =>
			`/${category}/${id}`;
	});

	it('should allow generators that return RouteMap', () => {
		const result: PathGenerator = (id: string) => ({
			$: `/${id}`,
			details: `/${id}/details`,
		});
	});

	it('should not allow generators that return invalid PathLiteral', () => {
		// @ts-expect-error - should not allow trailing slash
		const result: PathGenerator = (id: string) => `${id}/`;
	});

	it('should (unfortunately) allow generators that return PathLiteral with leading slash and trailing slash', () => {
		const result: PathGenerator = (id: string) => `/${id}/`;
	});

	it('should not allow generators that return invalid RouteMap', () => {
		// @ts-expect-error - should not allow trailing slash
		const result: PathGenerator = (id: string) => ({
			$: `${id}/`,
		});
	});
});

describe('RouteMap', () => {
	it('should allow simple map', () => {
		const result: RouteMap = {
			$: '/',
		};
	});

	it('should allow nested map', () => {
		const result: RouteMap = {
			$: '/',
			posts: {
				$: '/posts',
			},
		};
	});

	it('should allow path generators', () => {
		const result: RouteMap = {
			$: '/',
			posts: {
				$: '/posts',
				id: (id: string) => `/${id}`,
			},
		};
	});

	it('should not allow invalid paths', () => {
		const result: RouteMap = {
			// @ts-expect-error - should not allow trailing slash
			$: 'root/',

			posts: {
				// @ts-expect-error - should not allow trailing slash
				$: 'posts/',
				// @ts-expect-error - should not allow trailing slash
				id: (id: string) => `${id}`,
			},
		};
	});
});

describe('ValidatePath', () => {
	it('should validate valid paths', () => {
		type ValidPath1 = ValidatePath<'/'>;
		type ValidPath2 = ValidatePath<'/example'>;
		type ValidPath3 = ValidatePath<'/example/nested'>;

		const path1: ValidPath1 = '/';
		const path2: ValidPath2 = '/example';
		const path3: ValidPath3 = '/example/nested';

		type Test1 = Expect<Equal<ValidPath1, '/'>>;
		type Test2 = Expect<Equal<ValidPath2, '/example'>>;
		type Test3 = Expect<Equal<ValidPath3, '/example/nested'>>;
	});

	it('should invalidate paths with trailing slashes', () => {
		type InvalidPath1 = ValidatePath<'nested/'>;
		type InvalidPath2 = ValidatePath<'/nested/'>;

		// @ts-expect-error - should not allow trailing slash
		const path1: InvalidPath1 = 'nested/';

		// @ts-expect-error - should not allow trailing slash
		const path2: InvalidPath2 = '/nested/';

		type Test1 = Expect<
			Equal<InvalidPath1, { error: 'Path has trailing slash'; path: 'nested/' }>
		>;
		type Test2 = Expect<
			Equal<
				InvalidPath2,
				{ error: 'Path has trailing slash'; path: '/nested/' }
			>
		>;
	});
});

describe('ValidRouteMap', () => {
	it('should validate a valid RouteMap', () => {
		type ValidMap = ValidRouteMap<{
			$: '/';
			posts: {
				$: '/posts';
				id: (id: string) => `/${string}`;
			};
		}>;

		const validMap: ValidMap = {
			$: '/',
			posts: {
				$: '/posts',
				id: (id: string) => `/${id}`,
			},
		};
	});

	it('should invalidate a RouteMap with invalid paths', () => {
		type InvalidMap = ValidRouteMap<{
			$: 'root/';
			posts: {
				$: 'posts/';
				id: (id: string) => `${string}/`;
			};
		}>;

		const invalidMap: InvalidMap = {
			// @ts-expect-error - should not allow trailing slash
			$: 'root/',
			posts: {
				// @ts-expect-error - should not allow trailing slash
				$: 'posts/',
				// @ts-expect-error - should not allow trailing slash
				id: (id: string) => `${id}/`,
			},
		};

		type Test1 = Expect<
			Equal<
				InvalidMap['$'],
				{ error: 'Path has trailing slash'; path: 'root/' }
			>
		>;
		type Test2 = Expect<
			Equal<
				InvalidMap['posts']['$'],
				{ error: 'Path has trailing slash'; path: 'posts/' }
			>
		>;
		type Test3 = Expect<
			Equal<
				ReturnType<InvalidMap['posts']['id']>,
				{ error: 'Path has trailing slash'; path: `${string}/` }
			>
		>;
	});
});

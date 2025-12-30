/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Equal,
	PathGenerator,
	PathLiteral,
	RouteMap,
	StringPartFromLiteral,
	Validate,
	ValidatePath,
	ValidLiteral,
	ValidRouteMap,
	WithLeadingSlash,
	WithoutTrailingSlash,
} from './types';

type Expect<T extends true> = T;

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

describe('WithoutTrailingSlash', () => {
	it('should remove trailing slash from paths', () => {
		type Path1 = WithoutTrailingSlash<'/example/'>;
		type Path2 = WithoutTrailingSlash<'/example/nested/'>;
		type Path3 = WithoutTrailingSlash<'/example'>;
		type Path4 = WithoutTrailingSlash<'/'>;
		type Path5 = WithoutTrailingSlash<''>;
		type Path6 = WithoutTrailingSlash<'without-leading/'>;
		type Path7 = WithoutTrailingSlash<'without-leading//'>;

		const path1: Path1 = '/example';
		const path2: Path2 = '/example/nested';
		const path3: Path3 = '/example';
		const path4: Path4 = '';
		const path5: Path5 = '';
		const path6: Path6 = 'without-leading';
		const path7: Path7 = 'without-leading';

		type Test1 = Expect<Equal<Path1, '/example'>>;
		type Test2 = Expect<Equal<Path2, '/example/nested'>>;
		type Test3 = Expect<Equal<Path3, '/example'>>;
		type Test4 = Expect<Equal<Path4, ''>>;
		type Test5 = Expect<Equal<Path5, ''>>;
		type Test6 = Expect<Equal<Path6, 'without-leading'>>;
		type Test7 = Expect<Equal<Path7, 'without-leading'>>;
	});
});

describe('WithLeadingSlash', () => {
	it('should add leading slash to paths', () => {
		type Path1 = WithLeadingSlash<'example'>;
		type Path2 = WithLeadingSlash<'/example'>;
		type Path3 = WithLeadingSlash<'example/nested'>;
		type Path4 = WithLeadingSlash<'/example/nested'>;
		type Path5 = WithLeadingSlash<''>;

		const path1: Path1 = '/example';
		const path2: Path2 = '/example';
		const path3: Path3 = '/example/nested';
		const path4: Path4 = '/example/nested';
		const path5: Path5 = '/';

		type Test1 = Expect<Equal<Path1, '/example'>>;
		type Test2 = Expect<Equal<Path2, '/example'>>;
		type Test3 = Expect<Equal<Path3, '/example/nested'>>;
		type Test4 = Expect<Equal<Path4, '/example/nested'>>;
		type Test5 = Expect<Equal<Path5, '/'>>;
	});

	it('should remove multiple leading slashes', () => {
		type Path1 = WithLeadingSlash<'//example'>;
		type Path2 = WithLeadingSlash<'///example/nested'>;

		const path1: Path1 = '/example';
		const path2: Path2 = '/example/nested';

		type Test1 = Expect<Equal<Path1, '/example'>>;
		type Test2 = Expect<Equal<Path2, '/example/nested'>>;
	});
});

describe('StringPartFromPath', () => {
	it('should extract string part from paths', () => {
		type Path1 = StringPartFromLiteral<'/example/'>;
		type Path2 = StringPartFromLiteral<'example/nested/'>;
		type Path3 = StringPartFromLiteral<'/example'>;
		type Path4 = StringPartFromLiteral<'example'>;
		type Path5 = StringPartFromLiteral<'/'>;
		type Path6 = StringPartFromLiteral<''>;

		const path1: Path1 = 'example';
		const path2: Path2 = 'example/nested';
		const path3: Path3 = 'example';
		const path4: Path4 = 'example';
		const path5: Path5 = '';
		const path6: Path6 = '';

		type Test1 = Expect<Equal<Path1, 'example'>>;
		type Test2 = Expect<Equal<Path2, 'example/nested'>>;
		type Test3 = Expect<Equal<Path3, 'example'>>;
		type Test4 = Expect<Equal<Path4, 'example'>>;
		type Test5 = Expect<Equal<Path5, ''>>;
		type Test6 = Expect<Equal<Path6, ''>>;
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

describe('Validate', () => {
	it('should validate with ValidLiteral', () => {
		type ValidPath1 = Validate<ValidLiteral<'/example'>, '/example'>;
		type ValidPath2 = Validate<
			ValidLiteral<'/example/nested'>,
			'/example/nested'
		>;

		type Test1 = Expect<Equal<ValidPath1, '/example'>>;
		type Test2 = Expect<Equal<ValidPath2, '/example/nested'>>;

		type ValidQuery = Validate<ValidLiteral<'?search=query'>, '?search=query'>;
		type Test3 = Expect<Equal<ValidQuery, '?search=query'>>;

		type ValidHash = Validate<ValidLiteral<'#section1'>, '#section1'>;
		type Test4 = Expect<Equal<ValidHash, '#section1'>>;
	});

	it('should invalidate with ValidLiteral', () => {
		type InvalidPath1 = Validate<ValidLiteral<'nested/'>, 'nested/'>;
		type InvalidPath2 = Validate<ValidLiteral<'/nested/'>, '/nested/'>;
		type InvalidPath3 = Validate<ValidLiteral<'//nested'>, '//nested'>;

		type Test1 = Expect<
			Equal<
				InvalidPath1,
				{
					error: 'Invalid path';
					didYouMean: '/nested';
				}
			>
		>;
		type Test2 = Expect<
			Equal<
				InvalidPath2,
				{
					error: 'Invalid path';
					didYouMean: '/nested';
				}
			>
		>;
		type Test3 = Expect<
			Equal<
				InvalidPath3,
				{
					error: 'Invalid path';
					didYouMean: '/nested';
				}
			>
		>;

		type InvalidQuery1 = Validate<ValidLiteral<'?'>, '?'>;
		type InvalidQuery2 = Validate<ValidLiteral<'??kalle'>, '??kalle'>;

		type Test4 = Expect<
			Equal<
				InvalidQuery1,
				{
					error: 'Invalid path';
					didYouMean: {
						error: 'Must be non-empty path (/, ? or # alone are not allowed)';
						path: '?';
					};
				}
			>
		>;
		type Test5 = Expect<
			Equal<
				InvalidQuery2,
				{
					error: 'Invalid path';
					didYouMean: '?kalle';
				}
			>
		>;

		type InvalidHash1 = Validate<ValidLiteral<'#'>, '#'>;
		type InvalidHash2 = Validate<ValidLiteral<'##section'>, '##section'>;

		type Test6 = Expect<
			Equal<
				InvalidHash1,
				{
					error: 'Invalid path';
					didYouMean: {
						error: 'Must be non-empty path (/, ? or # alone are not allowed)';
						path: '#';
					};
				}
			>
		>;
		type Test7 = Expect<
			Equal<
				InvalidHash2,
				{
					error: 'Invalid path';
					didYouMean: '#section';
				}
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
				{
					error: 'Invalid path';
					didYouMean: '/root';
				}
			>
		>;
		type Test2 = Expect<
			Equal<
				InvalidMap['posts']['$'],
				{
					error: 'Invalid path';
					didYouMean: '/posts';
				}
			>
		>;
		type Test3 = Expect<
			Equal<
				ReturnType<InvalidMap['posts']['id']>,
				{
					error: 'Invalid path';
					didYouMean: `/${string}`;
				}
			>
		>;
	});
});

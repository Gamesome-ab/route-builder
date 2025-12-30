// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type YOLO = any;

export type Equal<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
		? true
		: false;

type Path = `/${string}`;
type Query = `?${string}`;
type Hash = `#${string}`;

export type PathLiteral = Path | Query | Hash;

export type PathGenerator = (...args: YOLO[]) => PathLiteral | RouteMap;

export type PathEntry = PathLiteral | PathGenerator;

export type RouteMap = {
	$?: '/' | Path;
} & {
	[key: string]: PathEntry | RouteMap;
};

type RootOf<T> = T extends { $: infer R extends string } ? R : '';

export type BaseUrl = '__base-url__' & { __brand: 'BaseUrl' };

type StringEval<S extends string, Empty, Slash, Else> = S extends ''
	? Empty
	: S extends '/'
		? Slash
		: Else;

export type ResolvedRoutes<
	T extends RouteMap | PathLiteral,
	P extends string = '', // Prefix
	B extends string = '', // BaseUrl
> = T extends string // Never used, but improves typehints when hovering the return from buildRoutes (without it, we lose the prefixes there)
	? Validate<ValidLiteral<`${P}${T}`>, `${P}${T}`>
	: {
			[K in keyof T]: T[K] extends string // Route is not just a string, specifically it has to be an object. it might have a string value.
				? K extends '$' // 1. We are in one of the leaf-nodes (since value is just a string).
					? StringEval<
							P,
							`${B}${T[K]}`, // 1.1.1. self($)-node with no prefix, i.e. the first self($)-node, where we can just return the value
							`${B}${T[K]}`, // 1.1.3. self($)-node with only / as prefix, i.e. the first self($)-node, where we can just return the value
							`${B}${P}` // 1.1.4. self($)-node with prefix. NOTE: Using ${Prefix}${T[K]} here would add the root-value twice, like /subItem/subItemTwo/subItemTwo
						>
					: `${B}${P}${T[K]}` // 1.2. For none-self($)-nodes we just add the value to the Prefix
				: T[K] extends (...args: infer A) => infer R // 2. Not in a string-leaf node.
					? R extends string // 2.1. Non-leaf-node that is a function
						? (...args: A) => `${B}${StringEval<P, RootOf<T>, '', P>}${R}` // 2.1.1. a function that returns a string, means we need to map up the concatenated string
						: R extends RouteMap // 2.1.2. a function that returns a non-string
							? (...args: A) => ResolvedRoutes<R, `${P}${RootOf<R>}`, B> // 2.1.2.1. in which we need to continue to resolve into.
							: never // 2.1.2.2. should never happen
					: T[K] extends RouteMap // 2.2. Non-string-leaf-node that is not a funcion (therefore an object)
						? P extends '' // 2.2.1. at the first top-node, meaning:
							? ResolvedRoutes<
									T[K],
									`${StringEval<RootOf<T>, '', '', RootOf<T>>}${RootOf<T[K]>}`,
									B
								> // 2.2.1.1. we can just start the Prefix with the root of the current node + root of child-node
							: ResolvedRoutes<T[K], `${P}${RootOf<T[K]>}`, B> // 2.2.1.2. other nodes where we need to add the root of the child-node to the existing Prefix
						: never; // 2.2.2. should never happen
		};

type WithoutLeadingQuery<S extends string> = S extends `?${infer R}`
	? WithoutLeadingQuery<R>
	: S;

type WithoutLeadingHash<S extends string> = S extends `#${infer R}`
	? WithoutLeadingHash<R>
	: S;

type WithoutLeadingSlash<S extends string> = S extends `/${infer R}`
	? WithoutLeadingSlash<R>
	: S;

export type WithLeadingSlash<S extends string> = S extends `/${infer R}`
	? `/${WithoutLeadingSlash<R>}`
	: `/${S}`;

type WithLeadingQuery<S extends string> = S extends `?${infer R}`
	? `?${WithoutLeadingQuery<R>}`
	: `?${S}`;

type WithLeadingHash<S extends string> = S extends `#${infer R}`
	? `#${WithoutLeadingHash<R>}`
	: `#${S}`;

export type WithoutTrailingSlash<S extends string> = S extends `${infer R}/`
	? WithoutTrailingSlash<R>
	: S;

export type StringPartFromLiteral<T extends string> = WithoutTrailingSlash<
	WithoutLeadingSlash<WithoutLeadingQuery<WithoutLeadingHash<T>>>
>;

// export type ValidatePath<T extends string> = T extends '/'
// 	? T
// 	: T extends `${string}/`
// 		? { error: 'Path has trailing slash'; path: T }
// 		: T;

export type ValidFirst$<T extends string> = WithLeadingSlash<
	WithoutTrailingSlash<T>
>;
export type ValidLiteral<T extends string> =
	StringPartFromLiteral<T> extends ''
		? {
				error: 'Must be non-empty path (/, ? or # alone are not allowed)';
				path: T;
			}
		: WithoutTrailingSlash<
				T extends Query
					? WithLeadingQuery<StringPartFromLiteral<T>>
					: T extends Hash
						? WithLeadingHash<StringPartFromLiteral<T>>
						: WithLeadingSlash<StringPartFromLiteral<T>>
			>;

// In some cases, for example when dealing with dynamic routes, they might end in ${string} which might be ts-valid if not actually validated through this.
export type Validate<Ideal, Actual> =
	Equal<Ideal, Actual> extends true
		? Actual
		: { error: 'Invalid path'; didYouMean: Ideal };

/**
 * A mapped type that validates all paths in a RouteMap to ensure they
 * conform to the ValidateFirst$ and ValidLiteral rules.
 */
export type ValidRouteMap<T, First extends true | false = true> = {
	[K in keyof T]: T[K] extends string
		? First extends true
			? K extends '$'
				? Validate<ValidFirst$<T[K]>, T[K]>
				: Validate<ValidLiteral<T[K]>, T[K]>
			: Validate<ValidLiteral<T[K]>, T[K]>
		: T[K] extends (...args: infer A) => infer R
			? R extends string
				? (...args: A) => Validate<ValidLiteral<R>, R>
				: T[K]
			: T[K] extends object
				? ValidRouteMap<T[K], false>
				: T[K];
};

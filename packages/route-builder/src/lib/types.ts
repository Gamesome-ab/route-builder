// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type YOLO = any;

type Path = '/' | `/${string}`;
type Query = `?${string}`;
type Hash = `#${string}`;

export type PathLiteral = Path | Query | Hash;

export type PathGenerator = (...args: YOLO[]) => PathLiteral | RouteMap;

export type PathEntry = PathLiteral | PathGenerator;

export interface RouteMap {
	[key: string]: PathEntry | RouteMap;
}

type RootOf<T> = T extends { $: infer R extends string } ? R : '';

type StringEval<S extends string, Empty, Slash, Else> = S extends ''
	? Empty
	: S extends '/'
		? Slash
		: Else;

export type ResolvedRoutes<
	T extends RouteMap | PathLiteral,
	Prefix extends string = '',
> = T extends string // Likely never used. Routes that are just a string should likely just be defined as such.
	? ValidatePath<T> extends never
		? never
		: `${Prefix}${T}` // If it would, we just add the Prefix to it.
	: {
			[K in keyof T]: T[K] extends string // Route is not just a string, specifically it has to be an object. it might have a string value.
				? ValidatePath<T[K]> extends never
					? never
					: K extends '$' // 1. We are in one of the leaf-nodes (since value is just a string).
						? Prefix extends '' // 1.1. a self($)-node
							? `${T[K]}` // 1.1.1. self($)-node with no prefix, i.e. the first self($)-node, where we can just return the value
							: `${Prefix}` // 1.1.2. self($)-node with prefix. NOTE: Using ${Prefix}${T[K]} here would add the root-value twice, like /subItem/subItemTwo/subItemTwo
						: `${Prefix}${T[K]}` // 1.2. For none-self($)-nodes we just add the value to the Prefix
				: T[K] extends (...args: infer A) => infer R // 2. Not in a string-leaf node.
					? R extends string // 2.1. Non-leaf-node that is a function
						? (...args: A) => `${StringEval<Prefix, RootOf<T>, '', Prefix>}${R}` // 2.1.1. a function that returns a string, means we need to map up the concatenated string
						: R extends RouteMap // 2.1.2. a function that returns a non-string
							? (...args: A) => ResolvedRoutes<R, `${Prefix}${RootOf<R>}`> // 2.1.2.1. in which we need to continue to resolve into.
							: never // 2.1.2.2. should never happen
					: T[K] extends RouteMap // 2.2. Non-string-leaf-node that is not a funcion (therefore an object)
						? Prefix extends '' // 2.2.1. at the first top-node, meaning:
							? ResolvedRoutes<
									T[K],
									`${StringEval<RootOf<T>, '', '', RootOf<T>>}${RootOf<T[K]>}`
								> // 2.2.1.1. we can just start the Prefix with the root of the current node + root of child-node
							: ResolvedRoutes<T[K], `${Prefix}${RootOf<T[K]>}`> // 2.2.1.2. other nodes where we need to add the root of the child-node to the existing Prefix
						: never; // 2.2.2. should never happen
		};

export type ValidatePath<T extends string> = T extends '/'
	? T
	: T extends `${string}/`
		? { error: 'Path has trailing slash'; path: T }
		: T;

/**
 * A mapped type that validates all paths in a RouteMap to ensure they
 * conform to the ValidatePath rules.
 */
export type ValidRouteMap<T> = {
	[K in keyof T]: T[K] extends string
		? ValidatePath<T[K]>
		: T[K] extends (...args: infer A) => infer R
			? R extends string
				? (...args: A) => ValidatePath<R>
				: T[K]
			: T[K] extends object
				? ValidRouteMap<T[K]>
				: T[K];
};

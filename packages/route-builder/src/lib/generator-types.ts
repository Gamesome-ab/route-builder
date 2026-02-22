/**
 * Expands a type alias into a plain mapped object shape.
 * Useful for improving editor hover readability.
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * Recursively expands object and function return types.
 * Useful when a type alias is otherwise displayed as a collapsed name in hovers.
 */
export type ExpandDeep<T> = T extends (...args: infer A) => infer R
	? (...args: A) => ExpandDeep<R>
	: T extends readonly (infer U)[]
		? ExpandDeep<U>[]
		: T extends object
			? Expand<{ [K in keyof T]: ExpandDeep<T[K]> }>
			: T;

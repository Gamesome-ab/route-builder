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
type RootOf<T> = T extends {
    $: infer R extends string;
} ? R : '';
type StringEval<S extends string, Empty, Slash, Else> = S extends '' ? Empty : S extends '/' ? Slash : Else;
export type ResolvedRoutes<T extends RouteMap | PathLiteral, Prefix extends string = ''> = T extends string ? ValidatePath<T> extends never ? never : `${Prefix}${T}` : {
    [K in keyof T]: T[K] extends string ? ValidatePath<T[K]> extends never ? never : K extends '$' ? Prefix extends '' ? `${T[K]}` : `${Prefix}` : `${Prefix}${T[K]}` : T[K] extends (...args: infer A) => infer R ? R extends string ? (...args: A) => `${StringEval<Prefix, RootOf<T>, '', Prefix>}${R}` : R extends RouteMap ? (...args: A) => ResolvedRoutes<R, `${Prefix}${RootOf<R>}`> : never : T[K] extends RouteMap ? Prefix extends '' ? ResolvedRoutes<T[K], `${StringEval<RootOf<T>, '', '', RootOf<T>>}${RootOf<T[K]>}`> : ResolvedRoutes<T[K], `${Prefix}${RootOf<T[K]>}`> : never;
};
export type ValidatePath<T extends string> = T extends '/' ? T : T extends `${string}/` ? {
    error: 'Path has trailing slash';
    path: T;
} : T;
/**
 * A mapped type that validates all paths in a RouteMap to ensure they
 * conform to the ValidatePath rules.
 */
export type ValidRouteMap<T> = {
    [K in keyof T]: T[K] extends string ? ValidatePath<T[K]> : T[K] extends (...args: infer A) => infer R ? R extends string ? (...args: A) => ValidatePath<R> : T[K] : T[K] extends object ? ValidRouteMap<T[K]> : T[K];
};
export {};
//# sourceMappingURL=types.d.ts.map
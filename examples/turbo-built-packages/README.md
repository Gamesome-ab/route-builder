# turbo-built-packages

This example is a minimal Turborepo that consumes a built `@gamesome/route-builder` package.

## Structure

- `packages/routes`: Defines `appRoutes` using `buildRoutes` and emits `.d.ts` files.
- `apps/consumer`: Imports `appRoutes` from `packages/routes`.

## Running

From the repo root:

```sh
pnpm install
pnpm nx build @gamesome/route-builder
pnpm --dir examples/turbo-built-packages install
pnpm --dir examples/turbo-built-packages build
```

## Issue #2 repro

From the repo root:

```sh
pnpm --dir examples/turbo-built-packages --filter @repo/routes exec tsc -p tsconfig.json --isolatedDeclarations --noEmit
```

Expected result:

```
src/index.ts(3,14): error TS9010: Variable must have an explicit type annotation with --isolatedDeclarations.
```

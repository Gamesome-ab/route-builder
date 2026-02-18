# turbo-with-built-packages

This example is a minimal Turborepo that consumes a built `@gamesome/route-builder` package.

## Structure

- `packages/routes`: Defines `appRoutes` using `buildRoutesWithGenerator` and generated types.
- `packages/declaration-routes`: Defines `appRoutes` using plain `buildRoutes` with `declaration: true` and `isolatedDeclarations: false`.
- `apps/consumer`: Imports route contracts from both `packages/routes` and `packages/declaration-routes`.

## Running

From the repo root:

```sh
pnpm install
pnpm nx build @gamesome/route-builder
pnpm --dir examples/turbo-with-built-packages install
pnpm --dir examples/turbo-with-built-packages build
```

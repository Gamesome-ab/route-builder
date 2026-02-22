# turbo-with-built-packages

A minimal Turborepo workspace that proves most `tsconfig.json` setups emit fully typed route declarations out of the box, and shows the generator workflow for `isolatedDeclarations`.

## Packages

| Package                                 | What it demonstrates                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------- |
| `packages/declaration-routes`           | Plain `buildRoutes` with `declaration: true` (Bundler). No generator needed.                  |
| `packages/declaration-node-next-routes` | Plain `buildRoutes` with `declaration: true` (NodeNext). No generator needed.                 |
| `packages/isolated-declarations-routes` | `buildRoutesWithGenerator` + generated type file, required when `isolatedDeclarations: true`. |
| `apps/consumer`                         | Imports all three packages and proves every route has concrete types.                         |

## Running

From the repo root:

```sh
pnpm install
pnpm nx build @gamesome/route-builder
pnpm --dir examples/turbo-with-built-packages install
pnpm --dir examples/turbo-with-built-packages build
```

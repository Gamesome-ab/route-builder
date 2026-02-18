# @gamesome/route-builder

Have you ever been frustrated by not having a good way to manage your application's routes in a type-safe manner? Are you resorting to magic strings scattered throughout your codebase, and constantly breaking prod when your api server tries to redirect to a non-existing route?

@gamesome/route-builder is here to help!

You can now build your application's routes in a type-safe way with support for dynamic segments like so:

```typescript
import { buildRoutes } from '@gamesome/route-builder';

const routes = buildRoutes({
  $: '/',
    user: {
      $: '/users',
      id: (userId: string) => `/${userId}`,
    },
});

routes.$; // "/"
routes.user.$; // "/users"
routes.user.id('123'); // "/users/123"
```

You can also get fancy by creating a branded type like so:

```typescript
type UserId = string & { __brand: 'UserId' };

const routes = buildRoutes({
  user: {
    id: (userId: string) => `/${userId as UserId}`,
  },
});

routes.user.id('123'); // "/users/${UserId}"
```

If you need base urls in your routes you can do that as well. You configure this in the second argument to `buildRoutes` by passing an object with a `baseUrl` property. If you want both relative and absolute urls you can set `inSeparateBranch` to `true` in the same object. Per default the base url will be represented as `BaseUrl` in typehints, but if you want the actual string you can set `fullBaseUrlInTypeHints` to `true`.

```typescript
const routes = buildRoutes(
  {
	$: '/',
	about: {
	  $: '/about',
	},
  },
  {
	baseUrl: 'https://example.com',
	inSeparateBranch: true,
	fullBaseUrlInTypeHints: true,
  }
);

routes.$; // "/"
routes.about.$; // "/about"
routes.withBaseUrl.$; // "https://example.com/"
routes.withBaseUrl.about.$; // "https://example.com/about"
```

## Type hints

In your IDE you will see autocompletion for both static and dynamic routes. as well as hints indicating what will be generated.

### Preview of the entire route tree

<picture>
  <img src="https://github.com/user-attachments/assets/25d20f84-415d-46e5-ac70-66672f2714ca" alt="dynamic route typehint" width="50%" />
</picture>

### Preview of an entry

<picture>
  <img src="https://github.com/user-attachments/assets/fc24d58b-0ed2-435d-8c66-029da1fcd2f9" alt="routes typehint" width="50%" />
</picture>

### Custom base url

<picture>
  <img src="https://github.com/user-attachments/assets/05cca05a-9437-4a46-8fcc-d60e027997d2" alt="routes typehint" width="50%" />
</picture>

### Shortened custom base url

<picture>
  <img src="https://github.com/user-attachments/assets/c6314c17-abe7-4e75-873d-1d88a1628856" alt="routes typehint" width="50%" />
</picture>

## Use cases

- More ergonomic way of routing in your frontend application
- Create a stable contract between your frontend and backend regarding frontend pages and their parameters
- Organise your [ts-rest](https://ts-rest.com) api routes in a type-safe manner (if you for some reason don't use ts-rest yet, you really should check it out! Probably works in other setups as well though)

## Installation

```bash
npm install @gamesome/route-builder
# or
yarn add @gamesome/route-builder
```

## Advanced: `isolatedDeclarations` / package exports

Most users should use `buildRoutes` directly and skip this section.

If you publish routes from a package and compile with declaration emit (`declaration: true`) together with `isolatedDeclarations: true`, TypeScript can require explicit export annotations that are awkward with deeply inferred route trees.

Important distinction:

- `declaration: true` alone: usually fine with regular `buildRoutes` and no generator.
- `declaration: true` + `isolatedDeclarations: true` on exported route objects: this is the problematic case the generator is meant to solve.

A working declaration-only example (no generator) exists in `examples/turbo-with-built-packages/packages/declaration-routes`.

For that case, this package includes a generator workflow:

1. Build runtime routes with `buildRoutesWithGenerator`
2. Generate a declaration file from that export using `route-builder-generate`
3. Type the export with the generated type

Example:

```typescript
import { buildRoutesWithGenerator } from '@gamesome/route-builder';
import type { AppRoutes } from './routes.generated';

export const appRoutes: AppRoutes = buildRoutesWithGenerator({
  $: '/',
  users: {
    $: '/users',
    id: (userId: string) => `/${userId}`,
  },
});
```

And generate the type file:

```bash
route-builder-generate src/index.ts --out src/routes.generated.ts --export appRoutes --type AppRoutes
```

Generating a `.ts` file is recommended for package builds, since `tsc` will then emit `dist/routes.generated.d.ts` automatically.

Use this only when you need declaration-emit compatibility for exported route objects. If you are building an app (not a reusable package), `buildRoutes` alone is usually the better DX.

# Setup, contributing and releasing

## Setup

This project uses nix. Do `direnv allow` in the root directory after cloning to enable the nix shell automatically. This will ensure you have the correct Node.js version and other dependencies installed.

This project uses `pnpm` and `nx` as monorepo manager. To install dependencies, run (in the root folder):

```bash
pnpm install
```

The project has githooks set up to make sure code is formatted and tests are run before committing. This is mainly to keep the robots in check and avoid unnecessary CI runs.

## Contributing

Feel free to open issues or submit pull requests! We welcome contributions of all kinds, whether it's bug fixes, new features, or documentation improvements.

## Releasing

To release a new version of the package, run the following command in the root folder:

```bash
nx release --skip-publish
nx release publish --otp=<your-npm-2fa-code>
```

The first command will bump the version, generate changelogs and create a git tag. The second command will publish the package to npm. Make sure to replace `<your-npm-2fa-code>` with your actual npm 2FA code if you have 2FA enabled on your npm account.

If you unsuccessfully run the first command, and it creates a git tag, you can delete the tag before pushing with:

```bash
git tag --delete <tag-name>
```

Tag name will be something like `v0.0.1`
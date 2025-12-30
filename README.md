# Route Builder

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

// Static route
routes.$; // "/"
routes.user.$; // "/users"

// Dynamic route
routes.user.id('123'); // "/users/123"
```

You can also get fancy by creating a branded type like so:

```typescripttypescript
type UserId = string & { __brand: 'UserId' };

const routes = buildRoutes({
	user: {
		id: (userId: string) => `/${userId as UserId}`,
	},
});

routes.user.id('123'); // "/users/${UserId}"
```

## Type hints

In your IDE you will see autocompletion for both static and dynamic routes. as well as hints indicating what will be generated.

### Preview of the entire route tree
<picture>
  <img src="./packages/route-builder/docs/prop-typehint.png" alt="dynamic route typehint" width="50%" />
</picture>

### Preview of an entry
<picture>
  <img src="./packages/route-builder/docs/obj-typehint.png" alt="routes typehint" width="50%" />
</picture>

### Custom base url
<picture>
  <img src="./packages/route-builder/docs/obj-typehint.png" alt="routes typehint" width="50%" />
</picture>

### Shortened custom base url
<picture>
  <img src="./packages/route-builder/docs/obj-typehint.png" alt="routes typehint" width="50%" />
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

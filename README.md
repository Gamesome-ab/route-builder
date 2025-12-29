# Route Builder

Typesafe, ergonomic JavaScript route-builder.

Lets you build your application's routes in a type-safe way with support for dynamic segments like so:

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

In your IDE you will see autocompletion for both static and dynamic routes. as well as hints indicating what will be generated:

<picture>
  <img src="./packages/route-builder/docs/obj-typehint.png" alt="routes typehint" width="50%" />
</picture>

<picture>
  <img src="./packages/route-builder/docs/prop-typehint.png" alt="dynamic route typehint" width="50%" />
</picture>

## Installation

```bash
npm install @gamesome/route-builder
# or
yarn add @gamesome/route-builder
```
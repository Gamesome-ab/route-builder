import { buildRoutesWithGenerator } from '@gamesome/route-builder';

export const appRoutes = buildRoutesWithGenerator({
	$: '/',
	users: {
		$: '/users',
	},
} as const);

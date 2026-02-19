import { buildRoutesWithGenerator } from '../../lib/build-routes';

export const appRoutes = buildRoutesWithGenerator({
	$: '/',
	users: {
		$: '/users',
	},
});

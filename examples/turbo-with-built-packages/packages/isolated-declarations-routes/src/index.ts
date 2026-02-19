import { buildRoutesWithGenerator } from '@gamesome/route-builder';
import type { AppRoutes } from './routes.generated';

export const appRoutes: AppRoutes = buildRoutesWithGenerator({
	$: '/',
	dashboard: {
		$: '/dashboard',
		settings: '/settings',
	},
	users: {
		$: '/users',
		id: (userId: string) => `/${userId}`,
		profile: (userId: string) => ({
			$: `/${userId}/profile`,
			edit: { $: '/edit' },
		}),
	},
	api: {
		$: '/api',
		v1: {
			$: '/v1',
			health: '/health',
		},
	},
});

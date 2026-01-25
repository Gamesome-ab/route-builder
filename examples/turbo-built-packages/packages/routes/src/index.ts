import { buildRoutes } from '@gamesome/route-builder';

export const appRoutes = buildRoutes({
	$: '/',
	t: {
		$: '/t',
		id: (threadId: string) => `/${threadId}`,
	},
	forms: {
		$: '/forms',
		id: (formId: string) => ({
			$: `/${formId}`,
			preview: { $: '/preview' },
		}),
	},
});

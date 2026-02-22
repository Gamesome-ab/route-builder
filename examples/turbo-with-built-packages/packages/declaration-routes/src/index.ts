import { buildRoutes } from '@gamesome/route-builder';

export const appRoutes = buildRoutes({
	$: '/',
	posts: {
		$: '/posts',
		id: (postId: string) => `/${postId}`,
		comments: (postId: string) => ({
			$: `/${postId}/comments`,
			id: (commentId: string) => `/${commentId}`,
		}),
	},
});

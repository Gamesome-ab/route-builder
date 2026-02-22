import { buildRoutesWithGenerator } from '../../lib/build-routes';

export const myRoutes = buildRoutesWithGenerator({
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

import { appRoutes as declarationRoutes } from '@repo/declaration-routes';

const postPath = declarationRoutes.posts.id('42');
const commentPath = declarationRoutes.posts.comments('42').id('7');

export const declarationRoutesDemo = {
	postPath,
	commentPath,
};

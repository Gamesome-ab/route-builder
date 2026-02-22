import { appRoutes } from '@repo/isolated-declarations-routes';
import { appRoutes as declarationRoutes } from '@repo/declaration-routes';
import { appRoutes as declarationNodeNextRoutes } from '@repo/declaration-node-next-routes';

const dashboardPath = appRoutes.dashboard.$;
const userProfileEditPath = appRoutes.users.profile('123').edit.$;
const declarationPostPath = declarationRoutes.posts.id('42');
const declarationCommentPath = declarationRoutes.posts.comments('42').id('7');
const nodeNextThreadPath = declarationNodeNextRoutes.t.id('42');

export const demoRoutes = {
	dashboardPath,
	userProfileEditPath,
	declarationPostPath,
	declarationCommentPath,
	nodeNextThreadPath,
};

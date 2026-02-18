import { appRoutes } from '@repo/routes';

const dashboardPath = appRoutes.dashboard.$;
const userProfileEditPath = appRoutes.users.profile('123').edit.$;

export const demoRoutes = { dashboardPath, userProfileEditPath };

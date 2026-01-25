import { appRoutes } from '@repo/routes';

const threadPath = appRoutes.t.id('42');
const previewPath = appRoutes.forms.id('123').preview;

export const demoRoutes = { threadPath, previewPath };

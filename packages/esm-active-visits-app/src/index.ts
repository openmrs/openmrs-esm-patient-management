import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-active-visits-app';

const options = {
  featureName: 'active-visits',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const activeVisits = getAsyncLifecycle(() => import('./active-visits-widget/active-visits.component'), options);

export const visitDetail = getAsyncLifecycle(() => import('./visits-summary/visit-detail.component'), options);

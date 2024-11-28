import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { createLeftPanelLink } from './left-panel-link.component';

const moduleName = '@openmrs/esm-bed-management-app';

const options = {
  featureName: 'bed-management',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const adminCardLink = getAsyncLifecycle(() => import('./admin-card-link.component'), options);

export const summaryLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bed-management',
    // t('summary', 'Summary')
    title: 'Summary',
  }),
  options,
);

export const adminLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bed-administration',
    // t('wardAllocation', 'Ward allocation')
    title: 'Ward allocation',
  }),
  options,
);

export const bedTypeLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bed-types',
    // t('bedTypes', 'Bed types')
    title: 'Bed types',
  }),
  options,
);

export const bedTagLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bed-tags',
    // t('bedTags', 'Bed tags')
    title: 'Bed tags',
  }),
  options,
);

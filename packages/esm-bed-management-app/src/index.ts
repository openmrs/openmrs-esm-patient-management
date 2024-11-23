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
  // t('summary', 'Summary')
  createLeftPanelLink({
    name: 'bed-management',
    title: 'Summary',
  }),
  options,
);

export const adminLeftPanelLink = getSyncLifecycle(
  // t('wardAllocation', 'Ward Allocation')
  createLeftPanelLink({
    name: 'administration',
    title: 'Ward Allocation',
  }),
  options,
);

export const bedTypeLeftPanelLink = getSyncLifecycle(
  // t('bedType', 'Bed Type')
  createLeftPanelLink({
    name: 'bed-type',
    title: 'Bed Type',
  }),
  options,
);

export const bedTagLeftPanelLink = getSyncLifecycle(
  // t('bedTag', 'Bed Tag')
  createLeftPanelLink({
    name: 'bed-tag',
    title: 'Bed Tag',
  }),
  options,
);

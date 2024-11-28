import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
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
    title: 'Summary',
  }),
  options,
);

export const adminLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'administration',
    title: 'Ward Allocation',
  }),
  options,
);

export const bedTypeLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bed-type',
    title: 'Bed Type',
  }),
  options,
);

export const bedTagLeftPanelLink = getSyncLifecycle(
  createLeftPanelLink({
    name: 'bed-tag',
    title: 'Bed Tag',
  }),
  options,
);

export const newBedModal = getAsyncLifecycle(() => import('./bed-administration/new-bed-form.modal'), options);
export const editBedModal = getAsyncLifecycle(() => import('./bed-administration/edit-bed-form.modal'), options);
export const newBedTagModal = getAsyncLifecycle(() => import('./bed-tag/new-tag-form.modal'), options);
export const editBedTagModal = getAsyncLifecycle(() => import('./bed-tag/edit-tag-form.modal'), options);
export const newBedTypeModal = getAsyncLifecycle(() => import('./bed-type/new-bed-type-form.modal'), options);
export const editBedTypeModal = getAsyncLifecycle(() => import('./bed-type/edit-bed-type-form.modal'), options);

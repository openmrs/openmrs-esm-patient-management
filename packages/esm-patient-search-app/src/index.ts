import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-patient-search-app';

const options = {
  featureName: 'patient-search',
  moduleName,
};

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const patientSearchIcon = getAsyncLifecycle(() => import('./patient-search-icon'), options);

// This extension renders the a Patient-Search Button, which when clicked, opens the search bar in an overlay.
export const patientSearchButton = getAsyncLifecycle(
  () => import('./patient-search-button/patient-search-button.component'),
  options,
);

// This extension is not compatible with the tablet view.
export const patientSearchBar = getAsyncLifecycle(() => import('./compact-patient-search.extension'), options);

export const patientSearchWorkspace = getAsyncLifecycle(
  () => import('./patient-search-workspace/patient-search.workspace'),
  options,
);

export const patientSearchWorkspace2 = getAsyncLifecycle(
  () => import('./patient-search-workspace/patient-search2.workspace'),
  options,
);

export const patientSearchStartVisitButton2 = getAsyncLifecycle(
  () => import('./patient-search-page/patient-banner/banner/start-visit-button2.component'),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

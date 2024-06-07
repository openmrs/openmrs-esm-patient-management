import { defineConfigSchema, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import rootComponent from './root.component';
import admissionRequestsWorkspace from './ward-workspace/admission-requests-workspace.component';
import { configSchema } from './config-schema';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-ward-app';

const options = {
  featureName: 'ward',
  moduleName,
};

export const root = getSyncLifecycle(rootComponent, options);

export const admissionRequestWorkspace = getSyncLifecycle(admissionRequestsWorkspace, options);
export function startupApp() {
  registerBreadcrumbs([]);

  defineConfigSchema(moduleName, configSchema);
}

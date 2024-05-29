import { defineConfigSchema, defineExtensionConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerBreadcrumbs } from '@openmrs/esm-framework';
import rootComponent from './root.component';
import { configSchema } from './config-schema';
import { admittedPatientHeaderAddressConfigSchema } from './admitted-patient/admitted-patient-header/admitted-patient-header-config-schema';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const moduleName = '@openmrs/esm-ward-app';

const options = {
  featureName: 'ward',
  moduleName,
};

export const root = getSyncLifecycle(rootComponent, options);

export function startupApp() {
  registerBreadcrumbs([]);

  defineConfigSchema(moduleName, configSchema);
  defineExtensionConfigSchema('admitted-patient-header-address', admittedPatientHeaderAddressConfigSchema );
}

// extensions:
export const admittedPatientHeaderAddress = getAsyncLifecycle(
  () => import('./admitted-patient/admitted-patient-header/admitted-patient-header-address'),
  {
    featureName: 'displays the patient address(es) in the ward view patient header',
    moduleName,
  },
);
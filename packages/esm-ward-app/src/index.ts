import {
  defineConfigSchema,
  defineExtensionConfigSchema,
  getAsyncLifecycle,
  getSyncLifecycle,
  registerBreadcrumbs,
} from '@openmrs/esm-framework';
import rootComponent from './root.component';
import { configSchema } from './config-schema';
import {
  admittedPatientHeaderAddressConfigSchema,
  admittedPatientHeaderNameConfigSchema,
} from './admitted-patient/admitted-patient-header/admitted-patient-header-config-schema';

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
  defineExtensionConfigSchema('admitted-patient-header-address', admittedPatientHeaderAddressConfigSchema);
  defineExtensionConfigSchema('admitted-patient-header-name', admittedPatientHeaderNameConfigSchema);
}

// extensions:
export const admittedPatientHeaderAddress = getAsyncLifecycle(
  () => import('./admitted-patient/admitted-patient-header/admitted-patient-header-address'),
  {
    featureName: 'displays the patient address(es) in the ward view patient header',
    moduleName,
  },
);

export const admittedPatientHeaderName = getAsyncLifecycle(
  () => import('./admitted-patient/admitted-patient-header/admitted-patient-header-name'),
  {
    featureName: 'displays the patient name in ward view patient header',
    moduleName,
  },
);

export const admittedPatientHeaderBedNumber = getAsyncLifecycle(
  () => import('./admitted-patient/admitted-patient-header/admitted-patient-header-bed-number'),
  {
    featureName: 'displays the bed number in the ward view patient header',
    moduleName,
  },
);

export const admittedPatientHeaderAge = getAsyncLifecycle(
  () => import('./admitted-patient/admitted-patient-header/admitted-patient-header-age'),
  {
    featureName: 'displays the patient age in the ward view patient header',
    moduleName,
  },
);

export const admittedPatientHeaderReason = getAsyncLifecycle(
  () => import('./admitted-patient/admitted-patient-header/admitted-patient-header-reason'),
  {
    featureName: 'displays the reason for patient admit in ward view patient header',
    moduleName,
  },
);

export const admittedPatientHeaderTime = getAsyncLifecycle(
  () => import('./admitted-patient/admitted-patient-header/admitted-patient-header-time'),
  {
    featureName: 'displays when the patient was admitted in the ward view patient header',
    moduleName,
  },
);

// workspaces:
export const pendingAdmissionRequestsWorkspace = getAsyncLifecycle(
  () => import('./admission-requests/pending-admission-requests.workspace'),
  {
    featureName: 'pending-admission-requests-workspace', 
    moduleName,
  }
)

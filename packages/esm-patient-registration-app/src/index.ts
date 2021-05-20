import {
  registerBreadcrumbs,
  defineConfigSchema,
  getAsyncLifecycle,
  registerSynchronizationCallback,
} from '@openmrs/esm-framework';
import { backendDependencies } from './openmrs-backend-dependencies';
import { esmPatientRegistrationSchema } from './config-schemas/openmrs-esm-patient-registration-schema';
import {
  fetchCurrentSession,
  fetchAddressTemplate,
  fetchPatientIdentifierTypesWithSources,
  fetchAllRelationshipTypes,
} from './offline.resources';
import FormManager from './patient-registration/form-manager';
import { syncAddedPatients } from './offline';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

function setupOpenMRS() {
  const moduleName = '@openmrs/esm-patient-registration-app';
  const pageName = 'patient-registration';

  const options = {
    featureName: 'Patient Registration',
    moduleName,
  };

  defineConfigSchema(moduleName, esmPatientRegistrationSchema);

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/${pageName}`,
      title: 'Patient Registration',
      parent: `${window.spaBase}/home`,
    },
  ]);

  registerSynchronizationCallback(() => syncAddedPatients(new AbortController()));

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import('./root.component'), options),
        route: /^patient-registration/,
        online: {
          savePatientForm: FormManager.savePatientFormOnline,
        },
        offline: {
          savePatientForm: FormManager.savePatientFormOffline,
        },
        resources: {
          currentSession: fetchCurrentSession,
          addressTemplate: fetchAddressTemplate,
          relationshipTypes: fetchAllRelationshipTypes,
          patientIdentifiers: fetchPatientIdentifierTypesWithSources,
        },
      },
      {
        load: getAsyncLifecycle(() => import('./root.component'), {
          featureName: 'edit-patient-details-form',
          moduleName,
        }),
        route: /^patient\/([a-zA-Z0-9\-]+)\/edit/,
      },
    ],
    extensions: [
      {
        id: 'add-patient-action',
        slot: 'top-nav-actions-slot',
        load: getAsyncLifecycle(() => import('./add-patient-link'), options),
        online: true,
        offline: true,
      },
      {
        id: 'patient-photo-widget',
        slot: 'patient-photo-slot',
        load: getAsyncLifecycle(() => import('./widgets/display-photo.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'edit-patient-details-button',
        slot: 'patient-actions-slot',
        load: getAsyncLifecycle(() => import('./widgets/edit-patient-details-button.component'), options),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };

import FormManager from './patient-registration/form-manager';
import { registerBreadcrumbs, defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import {
  fetchCurrentSession,
  fetchAddressTemplate,
  fetchPatientIdentifierTypesWithSources,
  fetchAllRelationshipTypes,
} from './offline.resources';
import { esmPatientRegistrationSchema } from './config-schema';
import { moduleName, patientRegistration } from './constants';
import { setupOffline } from './offline';

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  'webservices.rest': '^2.24.0',
};

const resources = {
  currentSession: fetchCurrentSession,
  addressTemplate: fetchAddressTemplate,
  relationshipTypes: fetchAllRelationshipTypes,
  identifierTypes: fetchPatientIdentifierTypesWithSources,
};

function setupOpenMRS() {
  const options = {
    featureName: 'Patient Registration',
    moduleName,
  };

  defineConfigSchema(moduleName, esmPatientRegistrationSchema);

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/${patientRegistration}`,
      title: 'Patient Registration',
      parent: `${window.spaBase}/home`,
    },
  ]);

  setupOffline();

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import('./root.component'), options),
        route: /^patient-registration/,
        online: {
          savePatientForm: FormManager.savePatientFormOnline,
          isOffline: false,
        },
        offline: {
          savePatientForm: FormManager.savePatientFormOffline,
          isOffline: true,
        },
        resources,
      },
      {
        load: getAsyncLifecycle(() => import('./root.component'), {
          featureName: 'edit-patient-details-form',
          moduleName,
        }),
        route: /^patient\/([a-zA-Z0-9\-]+)\/edit/,
        online: {
          savePatientForm: FormManager.savePatientFormOnline,
        },
        offline: {
          savePatientForm: FormManager.savePatientFormOffline,
        },
        resources,
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
        id: 'cancel-patient-edit-modal',
        load: getAsyncLifecycle(() => import('./widgets/cancel-patient-edit.component'), options),
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
      {
        id: 'edit-patient-details-button',
        slot: 'patient-search-actions-slot',
        load: getAsyncLifecycle(() => import('./widgets/edit-patient-details-button.component'), options),
        online: true,
        offline: true,
      },
      {
        id: 'delete-identifier-confirmation-modal',
        load: getAsyncLifecycle(() => import('./widgets/delete-identifier-confirmation-modal'), options),
        online: true,
        offline: true,
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };

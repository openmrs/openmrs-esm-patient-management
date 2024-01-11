import { registerBreadcrumbs, defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema } from './config-schema';
import { moduleName, patientRegistration } from './constants';
import { setupOffline } from './offline';
import rootComponent from './root.component';
import addPatientLinkComponent from './add-patient-link';
import patientPhotoComponent from './widgets/display-photo.component';
import editPatientDetailsButtonComponent from './widgets/edit-patient-details-button.component';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const options = {
  featureName: 'Patient Registration',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, esmPatientRegistrationSchema);

  registerBreadcrumbs([
    {
      path: `${window.spaBase}/${patientRegistration}`,
      // t('patientRegistrationBreadcrumb', 'Patient Registration')
      title: () =>
        Promise.resolve(
          window.i18next.t('patientRegistrationBreadcrumb', { defaultValue: 'Patient Registration', ns: moduleName }),
        ),
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${window.spaBase}/patient/:patientUuid/edit`,
      // t('editPatientDetailsBreadcrumb', 'Edit patient details')
      title: () =>
        Promise.resolve(
          window.i18next.t('editPatientDetailsBreadcrumb', { defaultValue: 'Edit patient details', ns: moduleName }),
        ),
      parent: `${window.spaBase}/patient/:patientUuid/chart`,
    },
  ]);

  setupOffline();
}

export const root = getSyncLifecycle(rootComponent, options);

export const editPatient = getSyncLifecycle(rootComponent, {
  featureName: 'edit-patient-details-form',
  moduleName,
});

export const addPatientLink = getSyncLifecycle(addPatientLinkComponent, options);

export const cancelPatientEditModal = getAsyncLifecycle(
  () => import('./widgets/cancel-patient-edit.component'),
  options,
);

export const patientPhoto = getSyncLifecycle(patientPhotoComponent, options);

export const editPatientDetailsButton = getSyncLifecycle(editPatientDetailsButtonComponent, {
  featureName: 'edit-patient-details',
  moduleName,
});

export const deleteIdentifierConfirmationModal = getAsyncLifecycle(
  () => import('./widgets/delete-identifier-confirmation-modal'),
  options,
);

import {
  fetchCurrentPatient,
  navigate,
  registerOfflinePatientHandler,
  setupOfflineSync,
  subscribePrecacheStaticDependencies,
  SyncProcessOptions,
} from '@openmrs/esm-framework';
import { cacheForOfflineHeaders, patientRegistration } from './constants';
import {
  fetchAddressTemplate,
  fetchAllRelationshipTypes,
  fetchCurrentSession,
  fetchPatientIdentifierTypesWithSources,
} from './offline.resources';
import FormManager from './patient-registration/form-manager';
import { PatientRegistration } from './patient-registration/patient-registration-types';

export function setupOffline() {
  setupOfflineSync(patientRegistration, [], syncPatientRegistration, {
    onBeginEditSyncItem(syncItem) {
      navigate({ to: `\${openmrsSpaBase}/patient/${syncItem.content.fhirPatient.id}/edit` });
    },
  });

  subscribePrecacheStaticDependencies(precacheStaticAssets);

  registerOfflinePatientHandler('esm-patient-registration-app', {
    displayName: 'Patient registration',
    async onOfflinePatientAdded({ patientUuid }) {
      await fetchCurrentPatient(patientUuid, { headers: cacheForOfflineHeaders });
    },
  });
}

async function precacheStaticAssets() {
  await Promise.all([
    fetchCurrentSession(),
    fetchAddressTemplate(),
    fetchAllRelationshipTypes(),
    fetchPatientIdentifierTypesWithSources(),
  ]);
}

export async function syncPatientRegistration(
  queuedPatient: PatientRegistration,
  options: SyncProcessOptions<PatientRegistration>,
) {
  await FormManager.savePatientFormOnline(
    queuedPatient._patientRegistrationData.isNewPatient,
    queuedPatient._patientRegistrationData.formValues,
    queuedPatient._patientRegistrationData.patientUuidMap,
    queuedPatient._patientRegistrationData.initialAddressFieldValues,
    queuedPatient._patientRegistrationData.identifierTypes,
    queuedPatient._patientRegistrationData.capturePhotoProps,
    queuedPatient._patientRegistrationData.patientPhotoConceptUuid,
    queuedPatient._patientRegistrationData.currentLocation,
    queuedPatient._patientRegistrationData.personAttributeTypes,
    options.abort,
  );
}

import {
  fetchCurrentPatient,
  OfflinePatientArgs,
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
  setupOfflineSync(patientRegistration, [], syncPatientRegistration);
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
    undefined,
    queuedPatient.formValues,
    queuedPatient.patientUuidMap,
    queuedPatient.initialAddressFieldValues,
    queuedPatient.initialIdentifiers,
    queuedPatient.identifierTypes,
    queuedPatient.capturePhotoProps,
    queuedPatient.patientPhotoConceptUuid,
    queuedPatient.currentLocation,
    queuedPatient.personAttributeSections,
    options.abort,
  );
}

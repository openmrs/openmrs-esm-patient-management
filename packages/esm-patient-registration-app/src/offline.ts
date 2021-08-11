import {
  fetchCurrentPatient,
  getGlobalStore,
  messageOmrsServiceWorker,
  setupOfflineSync,
  subscribePrecacheStaticDependencies,
  SyncProcessOptions,
} from '@openmrs/esm-framework';
import { patientRegistration } from './constants';
import {
  fetchAddressTemplate,
  fetchAllRelationshipTypes,
  fetchCurrentSession,
  fetchPatientIdentifierTypesWithSources,
} from './offline.resources';
import FormManager from './patient-registration/form-manager';
import { PatientRegistration } from './patient-registration/patient-registration-types';

export function setupOffline() {
  subscribePrecacheStaticDependencies(precacheStaticAssets);
  setupOfflineSync(patientRegistration, [], syncPatientRegistration);
  setupOnPatientAddedToOfflineListHandler();
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
    queuedPatient.identifierTypes,
    queuedPatient.capturePhotoProps,
    queuedPatient.patientPhotoConceptUuid,
    queuedPatient.currentLocation,
    queuedPatient.personAttributeSections,
    options.abort,
  );
}

function setupOnPatientAddedToOfflineListHandler() {
  const patientListStore = getGlobalStore('offline-patient-list-handlers', { onPatientAdded: [] });
  const patientListState = patientListStore.getState();
  patientListStore.setState({ onPatientAdded: [...patientListState.onPatientAdded, onPatientAddedToOfflineList] });
}

async function onPatientAddedToOfflineList({ patientUuid }: { patientUuid: string }) {
  const url = `/ws/fhir2/R4/Patient/${patientUuid}`;
  await messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${url}`,
  });

  await fetchCurrentPatient(patientUuid);
}

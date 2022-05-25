import {
  fetchCurrentPatient,
  makeUrl,
  messageOmrsServiceWorker,
  navigate,
  setupDynamicOfflineDataHandler,
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

  setupDynamicOfflineDataHandler({
    id: 'esm-patient-registration-app:patient',
    type: 'patient',
    displayName: 'Patient registration',
    async isSynced(patientUuid) {
      const expectedUrls = [`/ws/fhir2/R4/Patient/${patientUuid}`];
      const absoluteExpectedUrls = expectedUrls.map((url) => window.origin + makeUrl(url));
      const cache = await caches.open('omrs-spa-cache-v1');
      const keys = (await cache.keys()).map((key) => key.url);
      return absoluteExpectedUrls.every((url) => keys.includes(url));
    },
    async sync(patientUuid) {
      await messageOmrsServiceWorker({
        type: 'registerDynamicRoute',
        pattern: `/ws/fhir2/R4/Patient/${patientUuid}`,
      });

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
  // TODO: fix the arguments
  await FormManager.savePatientFormOnline(
    queuedPatient._patientRegistrationData.isNewPatient,
    queuedPatient._patientRegistrationData.formValues,
    queuedPatient._patientRegistrationData.patientUuidMap,
    queuedPatient._patientRegistrationData.initialAddressFieldValues,
    queuedPatient._patientRegistrationData.capturePhotoProps,
    queuedPatient._patientRegistrationData.patientPhotoConceptUuid,
    queuedPatient._patientRegistrationData.currentLocation,
    queuedPatient._patientRegistrationData.initialIdentifierValues,
    options.abort,
  );
}

import {
  fetchCurrentPatient,
  messageOmrsServiceWorker,
  OfflinePatientArgs,
  registerOfflinePatientHandler,
} from '@openmrs/esm-framework';

export function setupOffline() {
  registerOfflinePatientHandler('esm-patient-list-app', {
    displayName: 'Patient Lists',
    onOfflinePatientAdded: cachePatientData,
  });
}

async function cachePatientData({ patientUuid }: OfflinePatientArgs) {
  const url = `/ws/fhir2/R4/Patient/${patientUuid}`;
  await messageOmrsServiceWorker({
    type: 'registerDynamicRoute',
    pattern: `.+${url}`,
  });

  await fetchCurrentPatient(patientUuid);
}

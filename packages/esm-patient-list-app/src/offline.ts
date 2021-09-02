import { fetchCurrentPatient, registerOfflinePatientHandler } from '@openmrs/esm-framework';
import { cacheForOfflineHeaders } from './constants';

export function setupOffline() {
  registerOfflinePatientHandler('esm-patient-list-app', {
    displayName: 'Patient list',
    async onOfflinePatientAdded({ patientUuid }) {
      await fetchCurrentPatient(patientUuid, { headers: cacheForOfflineHeaders });
    },
  });
}

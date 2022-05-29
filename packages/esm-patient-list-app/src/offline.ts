import { fetchCurrentPatient, setupDynamicOfflineDataHandler } from '@openmrs/esm-framework';
import { cacheForOfflineHeaders } from './constants';

export function setupOffline() {
  setupDynamicOfflineDataHandler({
    id: 'esm-patient-list-app:patient',
    type: 'patient',
    displayName: 'Patient list',
    async isSynced(patientUuid) {
      // TODO.
      return true;
    },
    async sync(patientUuid) {
      await fetchCurrentPatient(patientUuid, { headers: cacheForOfflineHeaders });
    },
  });
}

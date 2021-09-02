import { omrsOfflineCachingStrategyHttpHeaderName, OmrsOfflineHttpHeaders } from '@openmrs/esm-framework';

export const moduleName = '@openmrs/esm-patient-registration-app';
export const patientRegistration = 'patient-registration';

export const cacheForOfflineHeaders: OmrsOfflineHttpHeaders = {
  [omrsOfflineCachingStrategyHttpHeaderName]: 'network-first',
};

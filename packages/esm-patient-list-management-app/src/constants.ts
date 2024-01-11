import { omrsOfflineCachingStrategyHttpHeaderName, type OmrsOfflineHttpHeaders } from '@openmrs/esm-framework';

export const cacheForOfflineHeaders: OmrsOfflineHttpHeaders = {
  [omrsOfflineCachingStrategyHttpHeaderName]: 'network-first',
};

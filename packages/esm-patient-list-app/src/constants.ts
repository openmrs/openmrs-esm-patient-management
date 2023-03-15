import { omrsOfflineCachingStrategyHttpHeaderName, OmrsOfflineHttpHeaders } from '@openmrs/esm-framework';

export const cacheForOfflineHeaders: OmrsOfflineHttpHeaders = {
  [omrsOfflineCachingStrategyHttpHeaderName]: 'network-first',
};

export const informationList = [
  {
    label: 'ID number #1',
    value: 'id number',
  },
  {
    label: 'Age',
    value: 'age',
  },
  {
    label: 'Gender',
    value: 'gender',
  },
  {
    label: 'Phone number',
    value: 'Phone numbers',
  },
];

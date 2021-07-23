import { offlineUuidPrefix } from '@openmrs/esm-framework';
import { EnrichedCohort } from './types';

const offlinePatientListUuid = `${offlineUuidPrefix}78e936dc-5240-4b9b-b5d6-6d3351503ab7`;

/**
 * A set of well-known patient lists which only exist locally on the user's device.
 */
export const deviceLocalPatientLists: Array<EnrichedCohort> = [
  {
    uuid: offlinePatientListUuid,
    id: offlinePatientListUuid,
    isLocal: true,
    description: 'Patients available while offline.',
    startDate: null,
    endDate: null,
    groupCohort: null,
    attributes: [],
    links: [],
    location: null,
    name: 'Offline Patients',
    resourceVersion: '1.8',
    voidReason: null,
    voided: false,
    isStarred: undefined,
    type: undefined,
  },
];

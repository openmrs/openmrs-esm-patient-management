import { offlineUuidPrefix } from '@openmrs/esm-framework';
import { PatientList, PatientListMember, PatientListMemberFilter, PATIENT_LIST_TYPE } from './types';

const offlinePatientListUuid = `${offlineUuidPrefix}78e936dc-5240-4b9b-b5d6-6d3351503ab7`;

/**
 * A set of well-known patient lists which only exist locally on the user's device.
 */
export const deviceLocalPatientLists: Array<PatientList> = [
  {
    id: offlinePatientListUuid,
    display: 'Offline Patients',
    description: 'Patients available while offline.',
    isStarred: false,
    memberCount: 0,
    type: PATIENT_LIST_TYPE.USER,
    isDeviceLocal: true,
  },
];

export async function getAllDeviceLocalPatientLists(
  filter?: PATIENT_LIST_TYPE,
  starred?: boolean,
  nameFilter?: string,
) {
  return deviceLocalPatientLists;
}

export async function getDeviceLocalPatientListMembers(
  id: string,
  filters?: Array<PatientListMemberFilter>,
): Promise<Array<PatientListMember>> {
  return [] as Array<PatientListMember>; // TODO
}

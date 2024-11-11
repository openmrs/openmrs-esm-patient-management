import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type BedDetail } from '../types';
import useSWR from 'swr';

export function useAssignedBedByPatient(patientUuid: string) {
  const url = `${restBaseUrl}/beds?patientUuid=${patientUuid}`;

  return useSWR<{ data: { results: Array<BedDetail> } }, Error>(url, openmrsFetch);
}

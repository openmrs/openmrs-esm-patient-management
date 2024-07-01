import useSWR from 'swr';
import { type AdmittedPatient } from '../types';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useAdmittedPatients(locationUuid: string) {
  const apiUrl = `/ws/rest/emrapi/inpatient/visits?currentLocation=${locationUuid}`;
  const { data, ...rest } = useSWR<{ data: AdmittedPatient[] }, Error>(apiUrl, openmrsFetch);

  return {
    admittedPatients: data?.data ?? null,
    ...rest,
  };
}

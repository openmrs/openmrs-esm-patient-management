import useSWR from 'swr';
import { type AdmittedPatient } from '../types';
import { openmrsFetch } from '@openmrs/esm-framework';
import useWardLocation from './useWardLocation';

export function useAdmittedPatients() {
  const { location } = useWardLocation();
  const apiUrl = location?.uuid ? `/ws/rest/emrapi/inpatient/visits?currentLocation=${location?.uuid}` : null;
  const { data, ...rest } = useSWR<{ data: AdmittedPatient[] }, Error>(apiUrl, openmrsFetch);

  return {
    admittedPatients: data?.data ?? null,
    ...rest,
  };
}

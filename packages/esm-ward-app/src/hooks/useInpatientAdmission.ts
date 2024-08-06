import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type InpatientAdmissionFetchResponse } from '../types';
import useWardLocation from './useWardLocation';

export function useInpatientAdmission() {
  const { location } = useWardLocation();

  // prettier-ignore
  const customRepresentation =
    'custom:(visit,' +
      'patient:(uuid,identifiers,voided,' +
        'person:(uuid,display,gender,age,birthdate,birthtime,preferredName,preferredAddress,dead,deathDate)),' + 
      'encounterAssigningToCurrentInpatientLocation:(encounterDatetime),' +
      'firstAdmissionOrTransferEncounter:(encounterDatetime),' +
    ')';
  const { data, ...rest } = useSWR<FetchResponse<InpatientAdmissionFetchResponse>, Error>(
    location
      ? `${restBaseUrl}/emrapi/inpatient/admission?currentInpatientLocation=${location.uuid}&v=${customRepresentation}`
      : null,
    openmrsFetch,
  );

  return {
    inpatientAdmissions: data?.data?.results,
    ...rest,
  };
}

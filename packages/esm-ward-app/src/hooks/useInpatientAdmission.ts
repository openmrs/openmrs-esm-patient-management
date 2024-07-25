import useSWR from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type InpatientAdmissionFetchResponse, InpatientRequestFetchResponse } from '../types';

export function useInpatientAdmission(locationUuid: string) {
  const customRepresentation =
    'custom:(visit,' +
    'patient:(uuid,identifiers,voided,' +
    'person:(uuid,display,gender,age,birthdate,birthtime,preferredName,preferredAddress,dead,deathDate)))';
  const apiUrl = `/ws/rest/emrapi/inpatient/admission?currentInpatientLocation=${locationUuid}`;
  const { data, ...rest } = useSWR<FetchResponse<InpatientAdmissionFetchResponse>, Error>(
    locationUuid
      ? `${restBaseUrl}/emrapi/inpatient/admission?currentInpatientLocation=${locationUuid}&v=${customRepresentation}`
      : null,
    openmrsFetch,
  );

  return {
    inpatientAdmissions: data?.data?.results,
    ...rest,
  };
}

import { openmrsFetch, restBaseUrl, type FetchResponse, type Patient } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

export default function useRestPatient(patientUuid: string) {
  const { data, ...rest } = useSWRImmutable<FetchResponse<Patient>>(
    patientUuid ? `${restBaseUrl}/patient/${patientUuid}` : null,
    openmrsFetch,
  );
  const results = useMemo(
    () => ({
      patient: data?.data,
      ...rest,
    }),
    [data, rest],
  );
  return results;
}

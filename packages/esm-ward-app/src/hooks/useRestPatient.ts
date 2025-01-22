import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, restBaseUrl, type FetchResponse, type Patient } from '@openmrs/esm-framework';

// prettier-ignore
const defaultRep =
  'custom:(' +
    'uuid,identifiers,voided,' +
    'person:(' +
      'uuid,display,gender,age,birthdate,birthtime,preferredName,preferredAddress,dead,deathDate)'
  + ')';

export default function useRestPatient(patientUuid: string, rep = defaultRep) {
  const { data, ...rest } = useSWRImmutable<FetchResponse<Patient>>(
    patientUuid ? `${restBaseUrl}/patient/${patientUuid}?v=${rep}` : null,
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

import { ConfigObject, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';

const usePatientId = (patientUuid: string) => {
  const config = useConfig() as ConfigObject;

  const { isLoading, data, error } = useSWR<{ data: { results: { patientId: string; age: number } } }>(
    `${config.customPatientIdUrl}=${patientUuid}`,
    openmrsFetch,
  );
  return { patient: data?.data?.results, error, isLoading };
};

export default usePatientId;

import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type NameTemplate } from '../../patient-registration.types';

/** Fetches a name template by its code name; does nothing when no code name is given. */
export function useNameTemplate(codeName: string) {
  const { data, error, isLoading } = useSWRImmutable<FetchResponse<NameTemplate>, Error>(
    codeName ? `${restBaseUrl}/nametemplate/${encodeURIComponent(codeName)}` : null,
    openmrsFetch,
  );

  return { nameTemplate: data?.data, error, isLoading };
}

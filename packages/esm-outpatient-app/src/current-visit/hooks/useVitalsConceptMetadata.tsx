import useSWRImmutable from 'swr/immutable';
import { openmrsFetch } from '@openmrs/esm-framework';

export function useVitalsConceptMetadata() {
  const customRepresentation =
    'custom:(setMembers:(uuid,display,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))';

  const apiUrl = `/ws/rest/v1/concept/?q=VITALS SIGNS&v=${customRepresentation}`;

  const { data, error } = useSWRImmutable<{ data: VitalsConceptMetadataResponse }, Error>(apiUrl, openmrsFetch);

  const conceptMetadata = data?.data?.results[0]?.setMembers;

  const conceptUnits = conceptMetadata?.length
    ? new Map<string, string>(conceptMetadata.map((concept) => [concept.uuid, concept.units]))
    : new Map<string, string>([]);
  return {
    data: conceptUnits,
    isError: error,
    isLoading: !data && !error,
    conceptMetadata,
  };
}

export const withUnit = (label: string, unit: string | null | undefined) => {
  return `${label} ${unit ? `(${unit})` : ''}`;
};

export interface ConceptMetadata {
  uuid: string;
  display: string;
  hiNormal: number | string | null;
  hiAbsolute: number | string | null;
  hiCritical: number | string | null;
  lowNormal: number | string | null;
  lowAbsolute: number | string | null;
  lowCritical: number | string | null;
  units: string | null;
}

interface VitalsConceptMetadataResponse {
  results: Array<{
    setMembers: Array<ConceptMetadata>;
  }>;
}

import useSWRImmutable from 'swr/immutable';
import { openmrsFetch, useConfig, formatTime, parseDate, restBaseUrl } from '@openmrs/esm-framework';
import { type Observation, type PatientVitals, Encounter } from '../../types/index';
import { type ConfigObject } from '../../config-schema';

export function useVitalsConceptMetadata() {
  const customRepresentation =
    'custom:(setMembers:(uuid,display,hiNormal,hiAbsolute,hiCritical,lowNormal,lowAbsolute,lowCritical,units))';

  const apiUrl = `${restBaseUrl}/concept/?q=VITALS SIGNS&v=${customRepresentation}`;

  const { data, error, isLoading } = useSWRImmutable<{ data: VitalsConceptMetadataResponse }, Error>(
    apiUrl,
    openmrsFetch,
  );

  const conceptMetadata = data?.data?.results[0]?.setMembers;

  const conceptUnits = conceptMetadata?.length
    ? new Map<string, string>(conceptMetadata.map((concept) => [concept.uuid, concept.units]))
    : new Map<string, string>([]);
  return {
    data: conceptUnits,
    isError: error,
    isLoading,
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

export const useVitalsFromObs = (encounter) => {
  const config = useConfig<ConfigObject>();

  const vitals: Array<PatientVitals> = [];

  encounter.forEach((enc) => {
    enc.obs?.forEach((obs: Observation) => {
      if (obs.concept?.uuid === config.concepts.pulseUuid) {
        vitals.push({
          pulse: obs.value,
          provider: {
            name: encounter.encounterProviders?.length ? encounter.encounterProviders[0].provider.person.display : '',
            role: encounter.encounterProviders?.length ? encounter.encounterProviders[0].encounterRole.display : '',
          },
          time: formatTime(parseDate(obs.obsDatetime)),
        });
      } else if (obs.concept?.uuid === config.concepts.oxygenSaturationUuid) {
        vitals.push({
          oxygenSaturation: obs.value,
        });
      } else if (obs.concept?.uuid === config.concepts.respiratoryRateUuid) {
        vitals.push({
          respiratoryRate: obs.value,
        });
      } else if (obs.concept?.uuid === config.concepts.temperatureUuid) {
        vitals.push({
          temperature: obs.value,
        });
      } else if (obs.concept?.uuid === config.concepts.systolicBloodPressureUuid) {
        vitals.push({
          systolic: obs.value,
        });
      } else if (obs.concept?.uuid === config.concepts.diastolicBloodPressureUuid) {
        vitals.push({
          diastolic: obs.value,
        });
      } else if (obs.concept?.uuid === config.concepts.weightUuid) {
        vitals.push({
          weight: obs.value,
        });
      } else if (obs.concept?.uuid === config.concepts.heightUuid) {
        vitals.push({
          height: obs.value,
        });
      }
    });
  });

  return vitals;
};

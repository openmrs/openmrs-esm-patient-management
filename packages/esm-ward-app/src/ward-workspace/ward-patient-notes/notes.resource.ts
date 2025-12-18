import { openmrsFetch, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { type EncounterPayload } from '../../types';
import { type PatientNote, type RESTPatientNote, type UsePatientNotes } from './types';

export function savePatientNote(payload: EncounterPayload, abortController: AbortController = new AbortController()) {
  return openmrsFetch(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function usePatientNotes(patientUuid: string, visitUuid: string, conceptUuids: Array<string>): UsePatientNotes {
  const customRepresentation =
    'custom:(uuid,patient:(uuid),obs:(uuid,concept:(uuid),obsDatetime,value:(uuid)),' +
    'encounterProviders:(uuid,provider:(uuid,person:(uuid,display)))';

  // Build URL dynamically, only include visit parameter if visitUuid is provided
  // This fixes the issue where visit=undefined causes empty results
  const encountersApiUrl = useMemo(() => {
    if (!patientUuid) return null;

    const params = new URLSearchParams();
    params.append('patient', patientUuid);
    if (visitUuid) {
      params.append('visit', visitUuid);
    }
    params.append('v', customRepresentation);
    return `${restBaseUrl}/encounter?${params.toString()}`;
  }, [patientUuid, visitUuid, customRepresentation]);

  const { data, error, isLoading, isValidating, mutate } = useOpenmrsFetchAll<RESTPatientNote>(encountersApiUrl);

  const patientNotes: Array<PatientNote> | null = useMemo(
    () =>
      data
        ? data
            .flatMap((encounter) => {
              return encounter.obs?.reduce((acc, obs) => {
                if (conceptUuids.includes(obs.concept.uuid)) {
                  acc.push({
                    id: encounter.uuid,
                    encounterNote: obs ? obs.value : '',
                    encounterNoteRecordedAt: obs ? obs.obsDatetime : '',
                    encounterProvider: encounter.encounterProviders.map((ep) => ep.provider.person.display).join(', '),
                  });
                }
                return acc;
              }, []);
            })
            .sort(
              (a, b) => new Date(b.encounterNoteRecordedAt).getTime() - new Date(a.encounterNoteRecordedAt).getTime(),
            )
        : [],
    [data, conceptUuids],
  );

  return useMemo(
    () => ({
      patientNotes,
      errorFetchingPatientNotes: error,
      isLoadingPatientNotes: isLoading,
      isValidatingPatientNotes: isValidating,
      mutatePatientNotes: mutate,
    }),
    [patientNotes, isLoading, isValidating, mutate, error],
  );
}

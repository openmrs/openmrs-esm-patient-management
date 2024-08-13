import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type PatientNote, type UsePatientNotes, type VisitEncountersFetchResponse } from './types';
import { type EncounterPayload } from '../../types';
import { useMemo } from 'react';

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

export function usePatientNotes(
  patientUuid: string,
  visitUuid: string,
  encounterType: string,
  conceptUuid: string,
): UsePatientNotes {
  const customRepresentation =
    'custom:(uuid,display,encounterDatetime,patient,obs,' +
    'encounterProviders:(uuid,display,' +
    'encounterRole:(uuid,display),' +
    'provider:(uuid,person:(uuid,display))),' +
    'diagnoses';
  const encountersApiUrl = `${restBaseUrl}/encounter?patient=${patientUuid}&encounterType=${encounterType}&visit=${visitUuid}&v=${customRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<FetchResponse<VisitEncountersFetchResponse>, Error>(
    patientUuid && encounterType ? encountersApiUrl : null,
    openmrsFetch,
  );

  const patientNotes: Array<PatientNote> | null = useMemo(
    () =>
      data
        ? data.data.results
            .map((encounter) => {
              const noteObs = encounter.obs.find((obs) => obs.concept.uuid === conceptUuid);

              return {
                id: encounter.uuid,
                diagnoses: encounter.diagnoses.map((d) => d.display).join(', '),
                encounterDate: encounter.encounterDatetime,
                encounterNote: noteObs ? noteObs.value : '',
                encounterNoteRecordedAt: noteObs ? noteObs.obsDatetime : '',
                encounterProvider: encounter.encounterProviders.map((ep) => ep.provider.person.display).join(', '),
                encounterProviderRole: encounter.encounterProviders.map((ep) => ep.encounterRole.display).join(', '),
              };
            })
            .sort(
              (a, b) => new Date(b.encounterNoteRecordedAt).getTime() - new Date(a.encounterNoteRecordedAt).getTime(),
            )
        : [],
    [data, conceptUuid],
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

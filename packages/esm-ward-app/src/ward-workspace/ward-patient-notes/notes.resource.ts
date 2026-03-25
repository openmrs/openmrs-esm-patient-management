import { useMemo } from 'react';
import { openmrsFetch, restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type EncounterPayload } from '../../types';
import { type PatientNote, type RESTPatientNote, type UsePatientNotes } from './types';

export function createPatientNote(payload: EncounterPayload, abortController: AbortController = new AbortController()) {
  return openmrsFetch(`${restBaseUrl}/encounter`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: payload,
    signal: abortController.signal,
  });
}

export function editPatientNote(obsUuid: string, note: string) {
  return openmrsFetch(`${restBaseUrl}/obs/${obsUuid}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: { value: note },
  });
}

export function usePatientNotes(patientUuid: string, visitUuid: string, conceptUuids: Array<string>): UsePatientNotes {
  const customRepresentation =
    'custom:(uuid,patient:(uuid),obs:(uuid,concept:(uuid),obsDatetime,value:(uuid)),encounterType,' +
    'encounterProviders:(uuid,provider:(uuid,person:(uuid,display)))';
  const encountersApiUrl = `${restBaseUrl}/encounter?patient=${patientUuid}&visit=${visitUuid}&v=${customRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useOpenmrsFetchAll<RESTPatientNote>(
    patientUuid ? encountersApiUrl : null,
  );

  const patientNotes: Array<PatientNote> | null = useMemo(
    () =>
      data
        ? data
            .flatMap((encounter) => {
              return encounter.obs?.reduce((acc, obs) => {
                if (conceptUuids.includes(obs.concept.uuid)) {
                  acc.push({
                    encounterUuid: encounter.uuid,
                    obsUuid: obs.uuid,
                    encounterNote: obs ? obs.value : '',
                    encounterNoteRecordedAt: obs ? obs.obsDatetime : '',
                    encounterProvider: encounter.encounterProviders.map((ep) => ep.provider.person.display).join(', '),
                    conceptUuid: obs.concept.uuid,
                    encounterTypeUuid: encounter.encounterType.uuid,
                  });
                }
                return acc;
              }, [] as Array<PatientNote>);
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

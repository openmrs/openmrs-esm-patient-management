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

  // Build URL dynamically, only include visit parameter if visitUuid is provided
  // This fixes the issue where visit=undefined causes empty results
  const encountersApiUrl = useMemo(() => {
    if (!patientUuid || !encounterType) return null;

    const params = new URLSearchParams();
    params.append('patient', patientUuid);
    params.append('encounterType', encounterType);
    if (visitUuid) {
      params.append('visit', visitUuid);
    }
    params.append('v', customRepresentation);
    return `${restBaseUrl}/encounter?${params.toString()}`;
  }, [patientUuid, encounterType, visitUuid, customRepresentation]);

  const { data, error, isLoading, isValidating, mutate } = useOpenmrsFetchAll<RESTPatientNote>(encountersApiUrl);

  const patientNotes: Array<PatientNote> | null = useMemo(
    () =>
      data
        ? data
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

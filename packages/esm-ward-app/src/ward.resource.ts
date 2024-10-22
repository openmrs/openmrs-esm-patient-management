import { openmrsFetch, type Patient, restBaseUrl, useSession } from '@openmrs/esm-framework';
import type { DispositionType, Encounter, EncounterPayload } from './types';
import useEmrConfiguration from './hooks/useEmrConfiguration';
import useWardLocation from './hooks/useWardLocation';

export function createEncounter(encounterPayload: EncounterPayload) {
  return openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: encounterPayload,
  });
}

export function useAdmitPatient() {
  const { location } = useWardLocation();
  const { currentProvider } = useSession();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();

  const admitPatient = (patient: Patient, dispositionType: DispositionType) => {
    return createEncounter({
      patient: patient.uuid,
      encounterType:
        dispositionType === 'ADMIT'
          ? emrConfiguration.admissionEncounterType.uuid
          : dispositionType === 'TRANSFER'
            ? emrConfiguration.transferWithinHospitalEncounterType.uuid
            : null,
      location: location?.uuid,
      encounterProviders: [
        {
          provider: currentProvider?.uuid,
          encounterRole: emrConfiguration.clinicianEncounterRole.uuid,
        },
      ],
      obs: [],
    });
  };

  return { admitPatient, isLoadingEmrConfiguration, errorFetchingEmrConfiguration };
}

export function assignPatientToBed(bedUuid: number, patientUuid: string, encounterUuid: string) {
  return openmrsFetch(`${restBaseUrl}/beds/${bedUuid}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: {
      patientUuid,
      encounterUuid,
    },
  });
}

export function removePatientFromBed(bedId: number, patientUuid: string) {
  return openmrsFetch(`${restBaseUrl}/beds/${bedId}?patientUuid=${patientUuid}`, {
    method: 'DELETE',
  });
}

import { openmrsFetch, type OpenmrsResource, type Patient, restBaseUrl, useSession } from '@openmrs/esm-framework';
import type { DispositionType, Encounter, EncounterPayload, ObsPayload } from './types';
import useEmrConfiguration from './hooks/useEmrConfiguration';
import useWardLocation from './hooks/useWardLocation';

export function useCreateEncounter() {
  const { location } = useWardLocation();
  const { currentProvider } = useSession();
  const { emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } = useEmrConfiguration();

  const createEncounter = (patient: Patient, encounterType: OpenmrsResource, obs: ObsPayload[] = []) => {
    const encounterPayload = {
      patient: patient.uuid,
      encounterType,
      location: location?.uuid,
      encounterProviders: [
        {
          provider: currentProvider?.uuid,
          encounterRole: emrConfiguration.clinicianEncounterRole.uuid,
        },
      ],
      obs,
    };

    return openmrsFetch<Encounter>(`${restBaseUrl}/encounter`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: encounterPayload,
    });
  };

  return { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration };
}

export function useAdmitPatient() {
  const { createEncounter, emrConfiguration, isLoadingEmrConfiguration, errorFetchingEmrConfiguration } =
    useCreateEncounter();

  const admitPatient = (patient: Patient, dispositionType: DispositionType) => {
    const encounterType =
      dispositionType === 'ADMIT'
        ? emrConfiguration.admissionEncounterType
        : dispositionType === 'TRANSFER'
          ? emrConfiguration.transferWithinHospitalEncounterType
          : null;
    return createEncounter(patient, encounterType);
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

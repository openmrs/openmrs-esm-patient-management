import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type InpatientAdmission } from '../types';
import useWardLocation from './useWardLocation';

export function useInpatientAdmission() {
  const { location } = useWardLocation();

  // prettier-ignore
  const customRepresentation =
    'custom:(visit,' +
    'patient:(uuid,identifiers,voided,' +
    'person:(uuid,display,gender,age,birthdate,birthtime,preferredName,preferredAddress,dead,deathDate)),' +
    'encounterAssigningToCurrentInpatientLocation:(encounterDatetime),' +
    'currentInpatientRequest:(dispositionLocation,dispositionType,disposition:(uuid,display),dispositionEncounter:(uuid,display),dispositionObsGroup:(uuid,display),visit:(uuid),patient:(uuid)),' +
    'firstAdmissionOrTransferEncounter:(encounterDatetime),' +
    ')';

  return useOpenmrsFetchAll<InpatientAdmission>(
    location
      ? `${restBaseUrl}/emrapi/inpatient/admission?currentInpatientLocation=${location.uuid}&v=${customRepresentation}`
      : null,
  );
}

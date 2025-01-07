import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { type InpatientAdmission } from '../types';

/**
 * fetches a list of inpatient admissions (in any location) for the given patients
 */
export function useInpatientAdmissionByPatients(patientUuids: string[]) {
  // prettier-ignore
  const customRepresentation =
    'custom:(visit,' +
    'patient:(uuid,identifiers:(uuid,display,identifier,identifierType),voided,' +
    'person:(uuid,display,gender,age,birthdate,birthtime,preferredName,preferredAddress,dead,deathDate)),' +
    'encounterAssigningToCurrentInpatientLocation:(encounterDatetime),' +
    'currentInpatientRequest:(dispositionLocation,dispositionType,disposition:(uuid,display),dispositionEncounter:(uuid,display),dispositionObsGroup:(uuid,display),visit:(uuid),patient:(uuid)),' +
    'firstAdmissionOrTransferEncounter:(encounterDatetime),' +
    'currentInpatientLocation' + 
    ')';

  return useOpenmrsFetchAll<InpatientAdmission>(
    patientUuids?.length > 0
      ? `${restBaseUrl}/emrapi/inpatient/admission?patients=${patientUuids.join(',')}&v=${customRepresentation}`
      : null,
  );
}

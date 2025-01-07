import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import type { DispositionType, InpatientRequest } from '../types';

// prettier-ignore
const defaultRep =
  'custom:(' +
    'dispositionLocation,' +
    'dispositionType,' +
    'disposition,' +
    'dispositionEncounter:full,' +
    'patient:(uuid,identifiers,voided,' +
      'person:(uuid,display,gender,age,birthdate,birthtime,preferredName,preferredAddress,dead,deathDate)),' + 
    'dispositionObsGroup,' +
    'visit)';

/**
 * fetches a list of pending inpatient requests (in any location) for the given patients
 */
export function useInpatientRequestByPatients(
  patientUuids: string[],
  dispositionType: Array<DispositionType> = ['ADMIT', 'TRANSFER'],
  rep: string = defaultRep,
) {
  const searchParams = new URLSearchParams();
  searchParams.set('dispositionType', dispositionType.join(','));
  searchParams.set('patients', patientUuids?.join(','));
  searchParams.set('v', rep);

  const { data, ...rest } = useOpenmrsFetchAll<InpatientRequest>(
    patientUuids?.length > 0 ? `${restBaseUrl}/emrapi/inpatient/request?${searchParams.toString()}` : null,
  );

  return { inpatientRequests: data, ...rest };
}

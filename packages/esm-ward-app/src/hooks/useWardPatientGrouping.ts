import { useMemo } from 'react';
import { createAndGetWardPatientGrouping, getInpatientAdmissionsUuidMap } from '../ward-view/ward-view.resource';
import { useAdmissionLocation } from './useAdmissionLocation';
import { useInpatientAdmission } from './useInpatientAdmission';

export function useWardPatientGrouping() {
  const admissionLocationResponse = useAdmissionLocation();
  const inpatientAdmissionResponse = useInpatientAdmission();

  const { inpatientAdmissions } = inpatientAdmissionResponse;
  const { admissionLocation } = admissionLocationResponse;
  const inpatientAdmissionsByPatientUuid = useMemo(() => {
    return getInpatientAdmissionsUuidMap(inpatientAdmissions);
  }, [inpatientAdmissions]);

  const {
    wardAdmittedPatientsWithBed,
    wardUnadmittedPatientsWithBed,
    wardPatientPendingCount,
    bedLayouts,
    wardUnassignedPatientsList,
  } = useMemo(() => {
    return createAndGetWardPatientGrouping(inpatientAdmissions, admissionLocation, inpatientAdmissionsByPatientUuid);
  }, [inpatientAdmissionsByPatientUuid, admissionLocation, inpatientAdmissions]);

  return {
    wardAdmittedPatientsWithBed,
    wardUnadmittedPatientsWithBed,
    wardUnassignedPatientsList,
    wardPatientPendingCount,
    admissionLocationResponse,
    inpatientAdmissionResponse,
    bedLayouts,
  };
}

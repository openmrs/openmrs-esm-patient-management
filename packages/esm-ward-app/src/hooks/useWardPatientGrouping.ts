import { useMemo } from 'react';
import { createAndGetWardPatientGrouping } from '../ward-view/ward-view.resource';
import { useAdmissionLocation } from './useAdmissionLocation';
import { useInpatientAdmission } from './useInpatientAdmission';
import { useInpatientRequest } from './useInpatientRequest';

export function useWardPatientGrouping() {
  const admissionLocationResponse = useAdmissionLocation();
  const inpatientAdmissionResponse = useInpatientAdmission();
  const inpatientRequestResponse = useInpatientRequest();

  const { data: inpatientAdmissions } = inpatientAdmissionResponse;
  const { admissionLocation } = admissionLocationResponse;
  const { inpatientRequests } = inpatientRequestResponse;

  const groupings = useMemo(() => {
    return { ...createAndGetWardPatientGrouping(inpatientAdmissions, admissionLocation, inpatientRequests) };
  }, [admissionLocation, inpatientAdmissions, inpatientRequests]) as ReturnType<typeof createAndGetWardPatientGrouping>;
  return {
    ...groupings,
    admissionLocationResponse,
    inpatientAdmissionResponse,
    inpatientRequestResponse,
    isLoading:
      admissionLocationResponse.isLoading || inpatientAdmissionResponse.isLoading || inpatientRequestResponse.isLoading,
    mutate() {
      admissionLocationResponse?.mutate();
      inpatientAdmissionResponse?.mutate();
      inpatientRequestResponse?.mutate();
    },
  };
}

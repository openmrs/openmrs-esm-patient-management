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
    const isDataLoaded=!admissionLocationResponse.isLoading && !inpatientAdmissionResponse.isLoading && !inpatientRequestResponse.isLoading;
     if(isDataLoaded) {
      return {...createAndGetWardPatientGrouping(inpatientAdmissions, admissionLocation, inpatientRequests),isDataLoading:false}
     } else {
       return {
        isDataLoading:true
       };
     }
  }, [admissionLocation, inpatientAdmissions]) as (ReturnType<typeof createAndGetWardPatientGrouping> & {isDataLoading:boolean});
  return {
    ...groupings,
    admissionLocationResponse,
    inpatientAdmissionResponse,
    inpatientRequestResponse,
  };
}

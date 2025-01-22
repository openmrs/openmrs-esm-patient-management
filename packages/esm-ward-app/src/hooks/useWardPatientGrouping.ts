import { useMemo } from 'react';
import { createAndGetWardPatientGrouping } from '../ward-view/ward-view.resource';
import { useAdmissionLocation } from './useAdmissionLocation';
import { useInpatientAdmission } from './useInpatientAdmission';
import { useInpatientRequest } from './useInpatientRequest';
import { useInpatientAdmissionByPatients } from './useInpatientAdmissionByPatients';
import useWardLocation from './useWardLocation';

export function useWardPatientGrouping() {
  const admissionLocationResponse = useAdmissionLocation();
  const inpatientAdmissionAtCurrentLocationResponse = useInpatientAdmission();
  const inpatientRequestResponse = useInpatientRequest();
  const { location: currentLocation } = useWardLocation();

  const { data: inpatientAdmissions } = inpatientAdmissionAtCurrentLocationResponse;
  const { admissionLocation } = admissionLocationResponse;
  const { inpatientRequests } = inpatientRequestResponse;

  // set of patients that are not in current ward, that we still
  // need to fetch info about their current location because they either:
  // - have a pending admission request to the current ward, or
  // - have a bed assignment in current ward but somehow not admitted (edge case)
  const patientsNotInCurrentWard = useMemo(() => {
    if (admissionLocation && inpatientAdmissions && inpatientRequests) {
      const _patientsNotInCurrentWard = new Set<string>();

      for (const bedLayout of admissionLocation.bedLayouts) {
        for (const bedPatient of bedLayout.patients) {
          _patientsNotInCurrentWard.add(bedPatient.uuid);
        }
      }
      for (const inpatientRequest of inpatientRequests) {
        _patientsNotInCurrentWard.add(inpatientRequest.patient.uuid);
      }

      for (const admission of inpatientAdmissions) {
        _patientsNotInCurrentWard.delete(admission.patient.uuid);
      }

      return _patientsNotInCurrentWard;
    } else {
      return null;
    }
  }, [admissionLocation, inpatientAdmissions, inpatientRequests]);

  const inpatientAdmissionsAtOtherLocationsResponse = useInpatientAdmissionByPatients(
    patientsNotInCurrentWard ? Array.from(patientsNotInCurrentWard) : null,
  );
  const { data: inpatientAdmissionsAtOtherLocations } = inpatientAdmissionsAtOtherLocationsResponse;

  const groupings = useMemo(() => {
    return {
      ...createAndGetWardPatientGrouping(
        inpatientAdmissions,
        admissionLocation,
        inpatientRequests,
        inpatientAdmissionsAtOtherLocations,
        currentLocation,
      ),
    };
  }, [
    admissionLocation,
    inpatientAdmissions,
    inpatientRequests,
    inpatientAdmissionsAtOtherLocations,
    currentLocation,
  ]) as ReturnType<typeof createAndGetWardPatientGrouping>;
  return {
    ...groupings,
    admissionLocationResponse,
    inpatientAdmissionResponse: inpatientAdmissionAtCurrentLocationResponse,
    inpatientRequestResponse,
    isLoading:
      admissionLocationResponse.isLoading ||
      inpatientAdmissionAtCurrentLocationResponse.isLoading ||
      inpatientRequestResponse.isLoading ||
      inpatientAdmissionsAtOtherLocationsResponse.isLoading,
    mutate() {
      admissionLocationResponse?.mutate();
      inpatientAdmissionAtCurrentLocationResponse?.mutate();
      inpatientRequestResponse?.mutate();
      inpatientAdmissionsAtOtherLocationsResponse?.mutate();
    },
  };
}

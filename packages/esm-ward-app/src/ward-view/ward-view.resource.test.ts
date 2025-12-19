import { createAndGetWardPatientGrouping, getWardMetrics } from './ward-view.resource';
import { type AdmissionLocationFetchResponse, type InpatientAdmission, type WardPatientGroupDetails } from '../types';
import type { Location } from '@openmrs/esm-framework';

describe('Ward View Resource', () => {
  const patient1 = {
    uuid: 'patient-uuid-1',
    person: {
      uuid: 'some-person-uuid-1',
      age: 24,
      gender: 'F',
    },
  };

  const patient2 = {
    uuid: 'patient-uuid-2',
    person: {
      uuid: 'some-person-uuid-2',
      age: 0.5,
      gender: 'M',
    },
  };

  const currentWardLocation: Location = {
    uuid: 'some-location-uuid',
  };

  const inpatientAdmissionsAtCurrentLocation: InpatientAdmission[] = [
    {
      patient: patient1,
      visit: undefined,
      encounterAssigningToCurrentInpatientLocation: undefined,
      firstAdmissionOrTransferEncounter: undefined,
      currentInpatientRequest: undefined,
      currentInpatientLocation: currentWardLocation,
    },
    {
      patient: patient2,
      visit: undefined,
      encounterAssigningToCurrentInpatientLocation: undefined,
      firstAdmissionOrTransferEncounter: undefined,
      currentInpatientRequest: undefined,
      currentInpatientLocation: currentWardLocation,
    },
  ];

  const admissionLocationFetchResponse: AdmissionLocationFetchResponse = {
    bedLayouts: [
      {
        rowNumber: 1,
        columnNumber: 1,
        bedNumber: '1',
        bedId: 1,
        bedUuid: 'some-bed-uuid',
        status: 'OCCUPIED',
        bedType: undefined,
        location: '',
        patients: [patient1],
        bedTagMaps: [],
      },
    ],
    occupiedBeds: 1,
    totalBeds: 1,
    ward: currentWardLocation,
  };

  describe('createAndGetWardPatientGrouping', () => {
    it('should handle null data', () => {
      const wardPatientGrouping = createAndGetWardPatientGrouping(null, null, null, null, null);
      expect(wardPatientGrouping.allWardPatientUuids.size).toBe(0);
    });
    it('should include inpatient admissions at current location when counting total patients', () => {
      const wardPatientGrouping = createAndGetWardPatientGrouping(
        inpatientAdmissionsAtCurrentLocation,
        null,
        null,
        null,
        null,
      );
      expect(wardPatientGrouping.allWardPatientUuids.size).toBe(2);
    });
    it('should return admitted patient with bed', () => {
      const wardPatientGrouping = createAndGetWardPatientGrouping(
        inpatientAdmissionsAtCurrentLocation,
        admissionLocationFetchResponse,
        null,
        null,
        currentWardLocation,
      );
      expect(wardPatientGrouping.wardAdmittedPatientsWithBed.size).toBe(1);
      expect(wardPatientGrouping.wardAdmittedPatientsWithBed.has('patient-uuid-1')).toBeTruthy();
    });
    it('should return admitted patient without bed', () => {
      const wardPatientGrouping = createAndGetWardPatientGrouping(
        inpatientAdmissionsAtCurrentLocation,
        admissionLocationFetchResponse,
        null,
        null,
        currentWardLocation,
      );
      expect(wardPatientGrouping.wardUnassignedPatientsList.length).toBe(1);
      expect(wardPatientGrouping.wardUnassignedPatientsList.at(0).patient.uuid).toBe('patient-uuid-2');
    });
  });

  describe('getWardMetrics', () => {
    const createAndGetWardPatientGroupingResults = createAndGetWardPatientGrouping(
      inpatientAdmissionsAtCurrentLocation,
      admissionLocationFetchResponse,
      null,
      null,
      currentWardLocation,
    );
    const wardPatientGrouping: WardPatientGroupDetails = {
      allWardPatientUuids: createAndGetWardPatientGroupingResults.allWardPatientUuids,
      bedLayouts: createAndGetWardPatientGroupingResults.bedLayouts,
      inpatientAdmissionsByPatientUuid: createAndGetWardPatientGroupingResults.inpatientAdmissionsByPatientUuid,
      wardAdmittedPatientsWithBed: createAndGetWardPatientGroupingResults.wardAdmittedPatientsWithBed,
      wardPatientPendingCount: createAndGetWardPatientGroupingResults.wardPatientPendingCount,
      wardUnadmittedPatientsWithBed: createAndGetWardPatientGroupingResults.wardUnadmittedPatientsWithBed,
      wardUnassignedPatientsList: createAndGetWardPatientGroupingResults.wardUnassignedPatientsList,
      inpatientRequestResponse: undefined,
      inpatientAdmissionResponse: undefined,
      admissionLocationResponse: undefined,
      isLoading: false,
      async mutate(): Promise<void> {
        return Promise.resolve(undefined);
      },
    };

    it('should return metrics', () => {
      const metrics = getWardMetrics(wardPatientGrouping);
      expect(metrics.patients).toBe('2');
      expect(metrics.freeBeds).toBe('0');
      expect(metrics.totalBeds).toBe('1');
      expect(metrics.newborns).toBe('1');
      expect(metrics.femalesOfReproductiveAge).toBe('1');
    });
  });
});

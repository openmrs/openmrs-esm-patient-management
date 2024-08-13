import { type AdmissionLocationFetchResponse, type BedType } from '../packages/esm-ward-app/src/types';
import { mockLocationInpatientWard } from './locations.mock';
import { mockPatientAlice, mockPatientBrian } from './patient.mock';

const mockBedType: BedType = {
  uuid: '0000-bed-type',
  name: 'mockBedType',
  displayName: 'Mock Bed Type',
  description: '',
  resourceVersion: '',
};

export const mockAdmissionLocation: AdmissionLocationFetchResponse = {
  totalBeds: 4,
  occupiedBeds: 1,
  ward: mockLocationInpatientWard,
  bedLayouts: [
    {
      rowNumber: 1,
      columnNumber: 1,
      bedNumber: 'bed1',
      bedId: 1,
      bedUuid: '0000-bed1',
      status: 'OCCUPIED',
      bedType: mockBedType,
      location: mockLocationInpatientWard.display,
      patients: [mockPatientAlice],
      bedTagMaps: [],
    },
    {
      rowNumber: 1,
      columnNumber: 2,
      bedNumber: 'bed2',
      bedId: 1,
      bedUuid: '0000-bed2',
      status: 'AVAILABLE',
      bedType: mockBedType,
      location: mockLocationInpatientWard.display,
      patients: [],
      bedTagMaps: [],
    },
    {
      rowNumber: 1,
      columnNumber: 3,
      bedNumber: 'bed3',
      bedId: 3,
      bedUuid: '0000-bed3',
      status: 'AVAILABLE',
      bedType: mockBedType,
      location: mockLocationInpatientWard.display,
      patients: [],
      bedTagMaps: [],
    },
    {
      rowNumber: 1,
      columnNumber: 4,
      bedNumber: 'bed4',
      bedId: 4,
      bedUuid: '0000-bed4',
      status: 'AVAILABLE',
      bedType: mockBedType,
      location: mockLocationInpatientWard.display,
      patients: [],
      bedTagMaps: [],
    },
  ],
};

export const mockInpatientAdmissions = [
  {
    patient: mockPatientBrian,
    visit: null,
  },
];

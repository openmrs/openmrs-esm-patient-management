import { type Visit } from '@openmrs/esm-framework';
import { mockPatientAlice } from './patient.mock';
import { mockLocationInpatientWard } from './locations.mock';

export const mockPastVisit = {
  data: {
    results: [
      {
        uuid: 'b80b8fba-ab62-11ec-b909-0242ac120002',
        patient: {
          uuid: 'b80b8b8c-ab62-11ec-b909-0242ac120002',
          display: '113RGH - Test Test Test',
        },
        visitType: {
          uuid: 'e7786ac0-ab62-11ec-b909-0242ac120002',
          display: 'Facility Visit',
        },
        location: {
          uuid: 'e7786d9a-ab62-11ec-b909-0242ac120002',
          display: 'Location Test',
        },
        startDatetime: '2022-03-23T10:29:00.000+0000',
        stopDatetime: '2022-03-24T10:29:00.000+0000',
        encounters: [],
      },
    ],
  },
};

export const mockVisitTypes = [
  {
    uuid: 'some-uuid1',
    name: 'Outpatient Visit',
    display: 'Outpatient Visit',
  },
  {
    uuid: 'some-uuid2',
    name: 'HIV Return Visit',
    display: 'HIV Return Visit',
  },
  {
    uuid: 'some-uuid3',
    name: 'Diabetes Clinic Visit',
    display: 'Diabetes Clinic Visit',
  },
  {
    uuid: 'some-uuid4',
    name: 'HIV Initial Visit',
    display: 'HIV Initial Visit',
  },
  {
    uuid: 'some-uuid5',
    name: 'Mental Health Visit',
    display: 'Mental Health Visit',
  },
  {
    uuid: 'some-uuid6',
    name: 'TB Clinic Visit',
    display: 'TB Clinic Visit',
  },
];

export const mockVisitAlice: Visit = {
  uuid: 'e5727d7e-8e1e-4615-bc3a-abd69e63234a',
  display: 'Clinic or Hospital Visit @ KGH - 06/27/2024 07:40 PM',
  patient: {
    uuid: mockPatientAlice.uuid,
    display: mockPatientAlice.display,
  },
  visitType: {
    uuid: 'f01c54cb-2225-471a-9cd5-d348552c337c',
    display: 'Clinic or Hospital Visit',
  },
  indication: null,
  location: mockLocationInpatientWard,
  startDatetime: '2024-06-27T19:40:16.000+0000',
  stopDatetime: null,
  encounters: [
    {
      uuid: '78f4dff6-197a-4314-b702-e1f796bf7531',
      display: 'Consultation 07/23/2024',
    },
    {
      uuid: '9e4cf2b3-8587-4999-93d6-3a3cbd50f9d8',
      display: 'Sierra Leone MCH Triage 07/16/2024',
    },
  ],
  attributes: [],
  voided: false,
  resourceVersion: '1.9',
};

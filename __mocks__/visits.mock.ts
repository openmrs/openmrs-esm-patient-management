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
];

export const mockSearchResults = {
  data: {
    results: [
      {
        display: '10000F1 - Eric Test Ric',
        identifiers: [
          {
            display: 'OpenMRS ID = 10000F1',
            identifier: '10000F1',
            voided: false,
          },
        ],
        patientId: 20,
        patientIdentifier: {
          identifier: '10000F1',
        },
        person: {
          gender: 'M',
          age: 35,
          birthdate: '1986-04-03T00:00:00.000+0000',
          birthdateEstimated: false,
          dead: false,
          deathDate: null,
          display: 'Eric Test Ric',
          personName: {
            givenName: 'Eric',
            middleName: 'Test',
            familyName: 'Ric',
          },
        },
        uuid: 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d',
      },
    ],
  },
};

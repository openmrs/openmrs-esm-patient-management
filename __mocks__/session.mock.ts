export const mockSession = {
  data: {
    authenticated: true,
    locale: 'en_GB',
    currentProvider: {
      uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c4057z',
      display: 'Test User',
      person: {
        uuid: 'ddd5fa89-48a6-432e-abb8-0d11b4be7e4f',
        display: 'Test User',
      },
      identifier: 'UNKNOWN',
      attributes: [],
    },
    sessionLocation: {
      uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
      display: 'Inpatient Ward',
      name: 'Inpatient Ward',
      description: null,
      address1: null,
      address2: null,
      cityVillage: null,
      stateProvince: null,
      country: null,
      postalCode: null,
      latitude: null,
      longitude: null,
      countyDistrict: null,
      address3: null,
      address4: null,
      address5: null,
      address6: null,
      tags: [
        {
          uuid: '8d4626ca-7abd-42ad-be48-56767bbcf272',
          display: 'Transfer Location',
        },
        {
          uuid: 'b8bbf83e-645f-451f-8efe-a0db56f09676',
          display: 'Login Location',
        },
        {
          uuid: '1c783dca-fd54-4ea8-a0fc-2875374e9cb6',
          display: 'Admission Location',
        },
      ],
      parentLocation: {
        uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
        display: 'Amani Hospital',
      },
      childLocations: [],
      retired: false,
      attributes: [],
      address7: null,
      address8: null,
      address9: null,
      address10: null,
      address11: null,
      address12: null,
      address13: null,
      address14: null,
      address15: null,
    },
    user: {
      uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002',
      display: 'admin',
      username: '',
      systemId: 'admin',
      userProperties: {
        loginAttempts: '0',
      },
      person: {
        uuid: '0775e6b7-f439-40e5-87a3-2bd11f3b9ee5',
        display: 'Test User',
      },
      privileges: [
        {
          uuid: '62431c71-5244-11ea-a771-0242ac160002',
          display: 'Manage Appointment Services',
        },
        {
          uuid: '6206682c-5244-11ea-a771-0242ac160002',
          display: 'Manage Appointments',
        },
        {
          uuid: '6280ff58-5244-11ea-a771-0242ac160002',
          display: 'Manage Appointment Specialities',
        },
      ],
      roles: [
        {
          uuid: '8d94f852-c2cc-11de-8d13-0010c6dffd0f',
          display: 'System Developer',
        },
        {
          uuid: '62c195c5-5244-11ea-a771-0242ac160002',
          display: 'Bahmni Role',
        },
        {
          uuid: '8d94f280-c2cc-11de-8d13-0010c6dffd0f',
          display: 'Provider',
        },
      ],
      retired: false,
    },
  },
};

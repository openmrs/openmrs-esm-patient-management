import { SearchedPatient } from '../../types/index';

export const mockSearchResults: SearchedPatient[] = [
  {
    patientId: 20,
    uuid: 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d',
    identifiers: [
      {
        display: 'OpenMRS ID = 10000F1',
        uuid: '',
        identifier: '10000F1',
        identifierType: {
          uuid: '',
          display: '',
        },
        location: {
          uuid: '',
          display: '',
        },
        preferred: true,
        voided: false,
      },
    ],
    patientIdentifier: {
      identifier: '10000F1',
    },
    person: {
      addresses: [
        {
          preferred: false,
          cityVillage: 'Test City',
          country: 'Test Country',
          postalCode: '000000',
          stateProvince: 'Test State',
        },
      ],
      age: 35,
      birthdate: '1986-04-03T00:00:00.000+0000',
      display: 'Eric Test Ric',
      gender: 'M',
      death: false,
      deathDate: null,
      personName: {
        givenName: 'Eric',
        familyName: 'Ric',
        middleName: 'Test',
      },
    },
    attributes: [
      {
        value: null,
        attributeType: {
          name: null,
        },
      },
    ],
    display: '10000F1 - Eric Test Ric',
  },
  {
    patientId: 30,
    uuid: 'cc12ad34-c24b-499c-8db9-a7ef4fc0b36d',
    identifiers: [
      {
        display: 'OpenMRS ID = 10000F2',
        uuid: '',
        identifier: '10000F2',
        identifierType: {
          uuid: '',
          display: '',
        },
        location: {
          uuid: '',
          display: '',
        },
        preferred: true,
        voided: false,
      },
    ],
    patientIdentifier: {
      identifier: '10000F2',
    },
    person: {
      addresses: [
        {
          preferred: false,
          cityVillage: 'Fancyland',
          country: 'Dream Country',
          postalCode: '000007',
          stateProvince: 'Some State',
        },
      ],
      age: 37,
      birthdate: '1985-06-12T00:00:00.000+0000',
      display: 'Dr. Covid Veerus',
      gender: 'F',
      death: false,
      deathDate: null,
      personName: {
        givenName: 'Dr. Covid',
        familyName: 'Veerus',
        middleName: '',
      },
    },
    attributes: [
      {
        value: null,
        attributeType: {
          name: null,
        },
      },
    ],
    display: '10000F2 - Dr. Covid Veerus',
  },
];

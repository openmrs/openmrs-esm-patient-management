import { type AdmissionLocation, type BedType } from '../packages/esm-ward-app/src/types';
import { mockLocationInpatientWard } from './locations.mock';
import { mockPatientAlice } from './patient.mock';

const mockBedType: BedType = {
  uuid: '0000-bed-type',
  name: 'mockBedType',
  displayName: 'Mock Bed Type',
  description: '',
  resourceVersion: '',
};

export const mockAdmissionLocation: AdmissionLocation = {
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

// TODO rework (and likely trim) after we rework this endpoint
export const mockInpatientVisits = [
  {
    visit: {
      uuid: 'decd8e01-de67-42da-a24b-66e2369e44fb',
      display: 'Clinic or Hospital Visit @ KGH - 07/19/2024 10:06 AM',
      patient: {
        uuid: 'cf52e661-7bbe-4260-8685-6ae7bc430e67',
        display: 'KGH24070005 - Nicks, Stevie',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8080/openmrs/ws/rest/v1/patient/cf52e661-7bbe-4260-8685-6ae7bc430e67',
            resourceAlias: 'patient',
          },
        ],
      },
      visitType: {
        uuid: 'f01c54cb-2225-471a-9cd5-d348552c337c',
        display: 'Clinic or Hospital Visit',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8080/openmrs/ws/rest/v1/visittype/f01c54cb-2225-471a-9cd5-d348552c337c',
            resourceAlias: 'visittype',
          },
        ],
      },
      indication: null,
      location: {
        uuid: '074b2ab0-716a-11eb-8aa6-0242ac110002',
        display: 'KGH',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8080/openmrs/ws/rest/v1/location/074b2ab0-716a-11eb-8aa6-0242ac110002',
            resourceAlias: 'location',
          },
        ],
      },
      startDatetime: '2024-07-19T10:06:00.000-0400',
      stopDatetime: null,
      encounters: [
        {
          uuid: '86d4ef13-1c2b-4b69-b2ae-4d8a4c6b2a3c',
          display: 'Admission aux soins hospitaliers 07/19/2024',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/encounter/86d4ef13-1c2b-4b69-b2ae-4d8a4c6b2a3c',
              resourceAlias: 'encounter',
            },
          ],
        },
      ],
      attributes: [],
      voided: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8080/openmrs/ws/rest/v1/visit/decd8e01-de67-42da-a24b-66e2369e44fb',
          resourceAlias: 'visit',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8080/openmrs/ws/rest/v1/visit/decd8e01-de67-42da-a24b-66e2369e44fb?v=full',
          resourceAlias: 'visit',
        },
      ],
      resourceVersion: '1.9',
    },
    patient: {
      uuid: 'cf52e661-7bbe-4260-8685-6ae7bc430e67',
      display: 'KGH24070005 - Nicks, Stevie',
      identifiers: [
        {
          uuid: 'ea5b61a8-cd35-4785-b894-1aa0fe154435',
          display: 'KGH EMR ID = KGH24070005',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/patient/cf52e661-7bbe-4260-8685-6ae7bc430e67/identifier/ea5b61a8-cd35-4785-b894-1aa0fe154435',
              resourceAlias: 'identifier',
            },
          ],
        },
      ],
      person: {
        uuid: 'cf52e661-7bbe-4260-8685-6ae7bc430e67',
        display: 'Nicks, Stevie',
        gender: 'F',
        age: 32,
        birthdate: '1992-01-01T00:00:00.000-0500',
        birthdateEstimated: true,
        dead: false,
        deathDate: null,
        causeOfDeath: null,
        preferredName: {
          uuid: '20939530-ccf2-4743-b17d-72f64115fceb',
          display: 'Nicks, Stevie',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/person/cf52e661-7bbe-4260-8685-6ae7bc430e67/name/20939530-ccf2-4743-b17d-72f64115fceb',
              resourceAlias: 'name',
            },
          ],
        },
        preferredAddress: {
          uuid: '6eaa7b62-368e-4fdb-94c6-653adeaebbb7',
          display: null,
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/person/cf52e661-7bbe-4260-8685-6ae7bc430e67/address/6eaa7b62-368e-4fdb-94c6-653adeaebbb7',
              resourceAlias: 'address',
            },
          ],
        },
        attributes: [],
        voided: false,
        birthtime: null,
        deathdateEstimated: false,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8080/openmrs/ws/rest/v1/person/cf52e661-7bbe-4260-8685-6ae7bc430e67',
            resourceAlias: 'person',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8080/openmrs/ws/rest/v1/person/cf52e661-7bbe-4260-8685-6ae7bc430e67?v=full',
            resourceAlias: 'person',
          },
        ],
        resourceVersion: '1.11',
      },
      voided: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8080/openmrs/ws/rest/v1/patient/cf52e661-7bbe-4260-8685-6ae7bc430e67',
          resourceAlias: 'patient',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8080/openmrs/ws/rest/v1/patient/cf52e661-7bbe-4260-8685-6ae7bc430e67?v=full',
          resourceAlias: 'patient',
        },
      ],
      resourceVersion: '1.8',
    },
    currentLocation: {
      uuid: '4d7e927d-6850-11ee-ab8d-0242ac120002',
      display: 'MCCU',
      name: 'MCCU',
      description: 'MCCU',
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
          uuid: 'd192602a-fa83-47b5-8831-a669c49aa22a',
          display: 'Maternal Admission Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/locationtag/d192602a-fa83-47b5-8831-a669c49aa22a',
              resourceAlias: 'locationtag',
            },
          ],
        },
        {
          uuid: 'cc42791b-858e-11ee-b8b7-0242ac110002',
          display: 'Appointment Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/locationtag/cc42791b-858e-11ee-b8b7-0242ac110002',
              resourceAlias: 'locationtag',
            },
          ],
        },
        {
          uuid: 'b8bbf83e-645f-451f-8efe-a0db56f09676',
          display: 'Login Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/locationtag/b8bbf83e-645f-451f-8efe-a0db56f09676',
              resourceAlias: 'locationtag',
            },
          ],
        },
        {
          uuid: 'd9865139-dfb4-11e4-bccc-56847afe9799',
          display: 'Vitals Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/locationtag/d9865139-dfb4-11e4-bccc-56847afe9799',
              resourceAlias: 'locationtag',
            },
          ],
        },
        {
          uuid: 'f5b9737b-14d5-402b-8475-dd558808e172',
          display: 'Admission Location',
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8080/openmrs/ws/rest/v1/locationtag/f5b9737b-14d5-402b-8475-dd558808e172',
              resourceAlias: 'locationtag',
            },
          ],
        },
      ],
      parentLocation: {
        uuid: '067c83ad-6850-11ee-ab8d-0242ac120002',
        display: 'MCOE',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8080/openmrs/ws/rest/v1/location/067c83ad-6850-11ee-ab8d-0242ac120002',
            resourceAlias: 'location',
          },
        ],
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
      links: [
        {
          rel: 'self',
          uri: 'http://localhost:8080/openmrs/ws/rest/v1/location/4d7e927d-6850-11ee-ab8d-0242ac120002',
          resourceAlias: 'location',
        },
        {
          rel: 'full',
          uri: 'http://localhost:8080/openmrs/ws/rest/v1/location/4d7e927d-6850-11ee-ab8d-0242ac120002?v=full',
          resourceAlias: 'location',
        },
      ],
      resourceVersion: '2.0',
    },
    timeSinceAdmissionInMinutes: 15,
    timeAtInpatientLocationInMinutes: 15,
  },
];

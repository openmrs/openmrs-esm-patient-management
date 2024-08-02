import { mockPatientAlice } from './patient.mock';
import { mockLocationInpatientWard } from './locations.mock';
import { type InpatientRequest } from '@openmrs/esm-ward-app/src/types';
import { mockPastVisit } from './visits.mock';
import { mockAddress } from './address.mock';

export const mockInpatientRequest: InpatientRequest = {
  patient: mockPatientAlice,
  dispositionLocation: mockLocationInpatientWard,
  dispositionType: 'ADMIT',
  disposition: {
    uuid: '6c047a20-c2bf-43ef-9e88-6da7b17e8c1a',
    display: 'Admit to hospital',
    name: {
      display: 'Admit to hospital',
      uuid: 'b1e494ef-4779-4262-bc42-56a79c39303c',
      name: 'Admit to hospital',
      locale: 'en',
      localePreferred: true,
      conceptNameType: 'FULLY_SPECIFIED',
    },
    datatype: {
      uuid: '8d4a4c94-c2cc-11de-8d13-0010c6dffd0f',
      display: 'N/A',
    },
    conceptClass: {
      uuid: '8d492774-c2cc-11de-8d13-0010c6dffd0f',
      display: 'Misc',
    },
    set: false,
    version: null,
    retired: false,
    names: [
      {
        uuid: '122a523c-cbec-4283-991f-858f44ffccca',
        display: 'Hospital admission',
      },
      {
        uuid: 'b1e494ef-4779-4262-bc42-56a79c39303c',
        display: 'Admit to hospital',
      },
      {
        uuid: 'f72fadb0-d5db-102d-ad2a-000c29c2a5d7',
        display: "ADMIS Á L'HÔPITAL",
      },
      {
        uuid: 'acdcc1d2-7414-4337-890e-c8ccbccda41a',
        display: 'Admèt nan lopital',
      },
      {
        uuid: '4f12edd7-e516-493b-bc21-da1a9d29873f',
        display: "Admettre à l'hôpital",
      },
    ],
    descriptions: [
      {
        uuid: '7d29309b-faaa-4767-83e6-6c75117fc569',
        display: 'patient will be admitted from the clinic to the hospital for managment of an acute problem.',
      },
    ],
    mappings: [
      {
        uuid: '75a1a11e-4943-102e-96e9-000c29c2a5d7',
        display: 'PIH: ADMIT TO HOSPITAL',
      },
      {
        uuid: 'b260d122-4864-102e-96e9-000c29c2a5d7',
        display: 'PIH: 3799',
      },
    ],
    answers: [],
    setMembers: [],
    attributes: [],
    resourceVersion: '2.0',
  },
  dispositionEncounter: {
    uuid: '6c047a20-c2bf-43ef-9e88-6da7b17e8c1a',
    display: 'Admit to hospital',
    encounterDatetime: '2021-09-28T11:00:00.000Z',
  },
};

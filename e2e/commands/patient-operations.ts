import { type APIRequestContext, expect } from '@playwright/test';
import { type Patient } from '../types';

export const generateRandomPatient = async (api: APIRequestContext): Promise<Patient> => {
  const sourcesRes = await api.get('idgen/identifiersource');
  await expect(sourcesRes.ok()).toBeTruthy();
  const sourcesData = await sourcesRes.json();

  const identifierSource = sourcesData.results[0];
  if (!identifierSource) {
    throw new Error('No identifier sources available');
  }
  const identifierRes = await api.post(`idgen/identifiersource/${identifierSource.uuid}/identifier`, {
    data: {},
  });
  await expect(identifierRes.ok()).toBeTruthy();
  const { identifier } = await identifierRes.json();

  const patientRes = await api.post('patient', {
     // TODO: This is not configurable right now. It probably should be.
    data: {
      identifiers: [
        {
          identifier,
          identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334',
          location: 'ba685651-ed3b-4e63-9b35-78893060758a',
          preferred: true,
        },
      ],
      person: {
        addresses: [
          {
            address1: 'Bom Jesus Street',
            cityVillage: 'Recife',
            country: 'Brazil',
            postalCode: '50030-310',
            stateProvince: 'Pernambuco',
          },
        ],
        birthdate: '2020-02-01',
        birthdateEstimated: false,
        dead: false,
        gender: 'M',
        names: [
          {
            familyName: `Smith${Math.floor(Math.random() * 10000)}`,
            givenName: `John${Math.floor(Math.random() * 10000)}`,
            preferred: true,
          },
        ],
      },
    },
  });

  await expect(patientRes.ok()).toBeTruthy();
  return await patientRes.json();
};

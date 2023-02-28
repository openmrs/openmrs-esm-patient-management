import { Encounter } from './../../packages/esm-active-visits-app/src/visits-summary/visit.resource';
import { APIRequestContext, expect } from '@playwright/test';

export const createEncounter = async (api: APIRequestContext, patientId: string, note?: string): Promise<Encounter> => {
  const encounterRes = await api.post('rest/v1/encounter', {
    data: {
      encounterDatetime: '2023-02-28T11:48:32+05:30',
      form: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      patient: patientId,
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      encounterProviders: [
        {
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          provider: 'f654ba52-11eb-4fd9-8ac9-b6c506e4beb5',
        },
      ],
      encounterType: '0e8230ce-bd1d-43f5-a863-cf44344fa4b0',
      obs: [
        {
          concept: {
            uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
            display: '',
          },
          value: note ?? 'This is a test note',
        },
      ],
    },
  });
  await expect(encounterRes.ok()).toBeTruthy();
  return await encounterRes.json();
};

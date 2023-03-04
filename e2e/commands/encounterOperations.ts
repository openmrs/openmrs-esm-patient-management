import { Encounter } from './../../packages/esm-active-visits-app/src/visits-summary/visit.resource';
import { APIRequestContext, expect } from '@playwright/test';
import dayjs from 'dayjs';

export const createEncounter = async (api: APIRequestContext, patientId: string, note?: string): Promise<Encounter> => {
  const encounterRes = await api.post('encounter', {
    data: {
      encounterDatetime: dayjs().format(),
      form: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      patient: patientId,
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
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

import { Encounter } from './../../packages/esm-active-visits-app/src/visits-summary/visit.resource';
import { APIRequestContext, expect } from '@playwright/test';
import dayjs from 'dayjs';

export const createEncounter = async (
  api: APIRequestContext,
  patientId: string,
  providerId: string,
  note?: string,
): Promise<Encounter> => {
  const encounterRes = await api.post('encounter', {
    data: {
      encounterDatetime: dayjs().format(),
      form: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      patient: patientId,
      encounterProviders: [
        {
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          provider: providerId,
        },
      ],
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      encounterType: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
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

export const deleteEncounter = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`encounter/${uuid}`, { data: {} });
};

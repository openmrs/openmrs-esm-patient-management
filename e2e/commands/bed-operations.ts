import { type APIRequestContext, expect } from '@playwright/test';
import { type Bed } from './types';

export const generateRandomBed = async (api: APIRequestContext): Promise<Bed> => {
  const bedRes = await api.post('/openmrs/ws/rest/v1/bed', {
    data: {
      bedNumber: 'BMW-123',
      bedType: 'Duplix',
      status: 'AVAILABLE',
      row: 9,
      column: 9,
      locationUuid: process.env.E2E_WARD_LOCATION_UUID,
    },
  });
  await expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

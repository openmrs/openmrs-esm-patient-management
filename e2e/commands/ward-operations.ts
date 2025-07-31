import { setSessionLocation } from '@openmrs/esm-framework/src';
import { type APIRequestContext, expect } from '@playwright/test';
import { type BedType, type Bed } from '../types';

export const generateRandomBed = async (api: APIRequestContext): Promise<Bed> => {
  const randomString = Math.random().toString(36).substring(6, 2).toUpperCase();
  const bedNumber = `B${randomString}${Math.floor(Math.random() * 100)}`;
  const bedRes = await api.post('/openmrs/ws/rest/v1/bed', {
    data: {
      bedNumber: bedNumber.substring(0, 10),
      bedType: 'Duplix',
      status: 'AVAILABLE',
      row: 60,
      colum: 12,
      locationUuid: process.env.E2E_WARD_LOCATION_UUID,
    },
  });
  await expect(bedRes.ok).toBeTruthy();
  return await bedRes.json();
};

export const generateBedType = async (api: APIRequestContext): Promise<BedType> => {
  const bedRes = await api.post('openmrs/ws/rest/v1/bedType', {
    data: {
      name: 'Duplix',
      displayName: 'Duplix',
      description: 'Test',
    },
  });
  await expect(bedRes.ok).toBeTruthy();
  return await bedRes.json();
};

export const deleteBed = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`bed${uuid}`, { data: {} });
  await expect(response.ok).toBeTruthy();
};

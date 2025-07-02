import { type APIRequestContext, expect } from '@playwright/test';
import { type BedType, type Bed } from '../types';

export const generateRandomBed = async (api: APIRequestContext, bedType: BedType): Promise<Bed> => {
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bedNumber = `B${randomString}${Math.floor(Math.random() * 100)}`;
  const bedRes = await api.post('/openmrs/ws/rest/v1/bed', {
    data: {
      bedNumber: bedNumber.substring(0, 10),
      bedType: bedType.name,
      status: 'AVAILABLE',
      row: Math.floor(Math.random() * 10) + 1,
      column: Math.floor(Math.random() * 10) + 1,
      locationUuid: process.env.E2E_WARD_LOCATION_UUID,
    },
  });
  await expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const generateBedType = async (api: APIRequestContext): Promise<BedType> => {
  const bedRes = await api.post('/openmrs/ws/rest/v1/bedtype', {
    data: {
      name: 'Guplix',
      displayName: 'Guplix',
      description: '',
    },
  });
  await expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const deleteBed = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`bed/${uuid}`, { data: {} });
  await expect(response.ok()).toBeTruthy();
};

export const deleteBedType = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`bedtype/${uuid}`, { data: {} });
  await expect(response.ok()).toBeTruthy();
};

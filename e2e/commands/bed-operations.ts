import { type APIRequestContext, expect } from '@playwright/test';
import { type BedType, type Bed } from './types';

export const generateRandomBed = async (api: APIRequestContext, bedType: BedType): Promise<Bed> => {
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bedNumber = `B${randomString}${Math.floor(Math.random() * 100)}`;
  const bedRes = await api.post('/openmrs/ws/rest/v1/bed', {
    data: {
      bedNumber: bedNumber.substring(0, 20),
      bedType: bedType.name,
      status: 'AVAILABLE',
      row: Math.floor(Math.random() * 18) + 1,
      column: Math.floor(Math.random() * 18) + 1,
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

export const dischargePatientFromBed = async (api: APIRequestContext, id: number, patientUuid: string) => {
  const response = await api.delete(`beds/${id}?patientUuid=${patientUuid}`);
  await expect(response.ok()).toBeTruthy();
};

export const deleteBed = async (api: APIRequestContext, bed: Bed) => {
  const response = await api.delete(`bed/${bed.uuid}`);
  await expect(response.ok()).toBeTruthy();
};

export const deleteBedType = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`bedtype/${uuid}`, { data: {} });
  await expect(response.ok()).toBeTruthy();
};

export const updateBedStatus = async (api: APIRequestContext, bedUuid: string, status: string) => {
  const url = `bed/${bedUuid}`;
  const data = { status };

  const response = await api.post(url, { data });
  await expect(response.ok()).toBeTruthy();
  return await response.json();
};

export const retireBedType = async (api: APIRequestContext, uuid: string, retireReason: string) => {
  const response = await api.put(`bedtype/${uuid}`, {
    data: {
      retired: 'true',
      retiredReason: retireReason,
    },
  });
  await expect(response.ok()).toBeTruthy();
};

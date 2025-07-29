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
  expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const generateBedType = async (api: APIRequestContext): Promise<BedType> => {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bedTypeName = `TestBedType_${randomString}`;
  const shortDisplayName = `T${randomString.substring(0, 4)}`; // Max 10 chars: T + 4 chars = 5 chars
  const bedRes = await api.post('/openmrs/ws/rest/v1/bedtype', {
    data: {
      name: bedTypeName, // Can be longer (255 chars max)
      displayName: shortDisplayName, // Must be ≤10 chars
      description: 'Test bed type for automated testing',
    },
  });
  expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const dischargePatientFromBed = async (api: APIRequestContext, id: number, patientUuid: string) => {
  const response = await api.delete(`beds/${id}?patientUuid=${patientUuid}`);
  expect(response.ok()).toBeTruthy();
};

export const deleteBed = async (api: APIRequestContext, bed: Bed) => {
  const response = await api.delete(`bed/${bed.uuid}`);
  expect(response.ok()).toBeTruthy();
};

export const deleteBedType = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`bedtype/${uuid}`, { data: {} });
  expect(response.ok()).toBeTruthy();
};

export const updateBedStatus = async (api: APIRequestContext, bedUuid: string, status: string) => {
  const url = `bed/${bedUuid}`;
  const data = { status };

  const response = await api.post(url, { data });
  expect(response.ok()).toBeTruthy();
  return await response.json();
};

export const retireBedType = async (api: APIRequestContext, uuid: string, retireReason: string) => {
  const response = await api.put(`bedtype/${uuid}`, {
    data: {
      retired: 'true',
      retiredReason: retireReason,
    },
  });
  expect(response.ok()).toBeTruthy();
};

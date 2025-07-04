import { type APIRequestContext, expect } from '@playwright/test';
import { type BedType, type Bed } from '../types';

export const generateRandomBed = async (api: APIRequestContext): Promise<Bed> => {
  const bedRes = await api.post('/openmrs/ws/rest/v1/bed', {
    data: {
      bedNumber: 'BMW-123',
      bedType: 'Duplix',
      status: 'AVAILABLE',
      row: 47,
      column: 73,
      locationUuid: process.env.E2E_WARD_LOCATION_UUID,
    },
  });
  await expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const bedAllocation = async (api: APIRequestContext, patientId: string, encounterUuid: string): Promise<Bed> => {
  const bedRes = await api.post('/openmrs/ws/rest/v1/beds/1', {
    data: {
      patientUuid: patientId,
      encounterUuid: encounterUuid,
    },
  });
  await expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const generateBedType = async (api: APIRequestContext): Promise<BedType> => {
  const bedRes = await api.post('/openmrs/ws/rest/v1/bedtype', {
    data: {
      name: 'duplix',
      displayName: 'Duplix',
      description: '',
    },
  });
  await expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

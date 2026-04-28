import { type APIRequestContext, expect } from '@playwright/test';
import { type BedType, type Bed } from './types';

export const generateRandomBed = async (api: APIRequestContext, bedType: BedType): Promise<Bed> => {
  const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
  const bedNumber = `B${randomString}${Math.floor(Math.random() * 100)}`;

  const bedRes = await api.post('/openmrs/ws/rest/v1/bed', {
    data: {
      bedNumber: bedNumber.substring(0, 10),
      bedType: bedType.name,
      column: Math.floor(Math.random() * 100) + 1,
      locationUuid: process.env.E2E_WARD_LOCATION_UUID,
      row: Math.floor(Math.random() * 100) + 1,
      status: 'AVAILABLE',
    },
  });
  expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const bedAllocation = async (api: APIRequestContext, patientId: string, encounterUuid: string): Promise<Bed> => {
  const bedRes = await api.post('/openmrs/ws/rest/v1/beds/1', {
    data: {
      patientUuid: patientId,
      encounterUuid: encounterUuid,
    },
  });
  expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const generateBedType = async (api: APIRequestContext): Promise<BedType> => {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bedTypeName = `TestBedType_${randomString}`;
  const shortDisplayName = `T${randomString}`;
  const bedRes = await api.post('/openmrs/ws/rest/v1/bedtype', {
    data: {
      description: 'Test bed type for automated testing',
      displayName: shortDisplayName, // Must be ≤10 chars
      name: bedTypeName, // Can be longer (255 chars max)
    },
  });
  expect(bedRes.ok()).toBeTruthy();
  return await bedRes.json();
};

export const dischargePatientFromBed = async (api: APIRequestContext, id: number, patientUuid: string) => {
  // The `id` parameter is required for REST API routing but is not used in the discharge logic - only `patientUuid` matters.
  // This is a workaround for BED-14 where the standard delete method throws "DELETE operation not supported".
  // See: https://openmrs.atlassian.net/browse/BED-14
  const response = await api.delete(`beds/${id}?patientUuid=${patientUuid}`);
  if (!response.ok()) {
    const errorBody = await response.text();
    throw new Error(`Discharge failed: ${errorBody}`);
  }
  expect(response.ok()).toBeTruthy();
};

export const deleteBed = async (api: APIRequestContext, bed: Bed) => {
  const response = await api.delete(`bed/${bed.uuid}`);
  expect(response.ok()).toBeTruthy();
};

export const deleteBedType = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`bedtype/${uuid}`);
  expect(response.ok()).toBeTruthy();
};

export const updateBedStatus = async (api: APIRequestContext, bedUuid: string, status: string) => {
  const url = `bed/${bedUuid}`;
  const data = { status };

  const response = await api.post(url, { data });

  if (!response.ok()) {
    console.error(`Bed update failed (${response.status()}): ${await response.text()}`);
  }

  expect(response.ok()).toBeTruthy();
  return await response.json();
};

export const bedLocation = async (api: APIRequestContext) => {
  const locationRes = await api.get(`/openmrs/ws/rest/v1/location/${process.env.E2E_WARD_LOCATION_UUID}`);
  expect(locationRes.ok()).toBeTruthy();
  return await locationRes.json();
};

export const retireBedType = async (api: APIRequestContext, uuid: string, retireReason: string) => {
  const response = await api.post(`bedtype/${uuid}`, {
    data: {
      retired: 'true',
      retiredReason: retireReason,
    },
  });
  expect(response.ok()).toBeTruthy();
  return await response.json();
};

export const generateBedTag = async (api: APIRequestContext) => {
  const bedTagName = `Tag_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const response = await api.post('/openmrs/ws/rest/v1/bedTag', {
    data: {
      name: bedTagName,
    },
  });
  expect(response.ok()).toBeTruthy();
  return await response.json();
};

export const resolveBedTypeUuidByName = async (api: APIRequestContext, name: string): Promise<string | undefined> => {
  const res = await api.get(`bedtype?v=default&name=${encodeURIComponent(name)}`);
  if (!res.ok()) return undefined;
  const json = await res.json();
  const found = json?.results?.find((t: any) => t.name === name);
  return found?.uuid;
};

export const resolveBedUuidByNumberAndLocation = async (
  api: APIRequestContext,
  bedNumber: string,
  locationUuid: string,
): Promise<string | undefined> => {
  const res = await api.get(`bed?locationUuid=${locationUuid}&v=full`);
  if (!res.ok()) return undefined;
  const json = await res.json();
  const found = json?.results?.find((b: any) => b.bedNumber === bedNumber);
  return found?.uuid;
};

export const resolveBedTagUuidByName = async (api: APIRequestContext, name: string): Promise<string | undefined> => {
  const res = await api.get(`bedTag?v=default&name=${encodeURIComponent(name)}`);
  if (!res.ok()) return undefined;
  const json = await res.json();
  const found = json?.results?.find((t: any) => t.name === name);
  return found?.uuid;
};

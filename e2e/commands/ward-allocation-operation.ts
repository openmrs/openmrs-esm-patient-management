import { type APIRequestContext } from '@playwright/test';
import { type BedWithLocation, type BedTypeData } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const bedType: BedTypeData = {
  uuid: uuidv4(),
  displayName: 'ICU Bed',
  description: 'ICU bed type',
  name: 'ICU Bed',
};

export const bed: BedWithLocation = {
  id: 58,
  uuid: uuidv4(),
  bedNumber: '58',
  column: 1,
  row: 2,
  status: 'AVAILABLE',
  location: {
    display: 'Ward 1',
    uuid: uuidv4(),
  },
  bedType: bedType,
};
export const createBedType = async (api: APIRequestContext, bedType: BedTypeData): Promise<BedTypeData> => {
  const response = await api.post('/openmrs/ws/rest/v1/bedtype', {
    data: bedType,
  });

  if (!response.ok()) {
    throw new Error(`Failed to create bed type: ${response.status()} - ${await response.text()}`);
  }

  return await response.json();
};

export const createBed = async (api: APIRequestContext, bed: BedWithLocation): Promise<BedWithLocation> => {
  const response = await api.post('bed', {
    data: bed,
  });

  if (!response.ok()) {
    throw new Error(`Failed to create bed: ${response.status()} - ${await response.text()}`);
  }

  return await response.json();
};

export const getBed = async (api: APIRequestContext): Promise<BedWithLocation> => {
  const bedsResponse = await api.get('/openmrs/ws/rest/v1/bed');
  const { results } = await bedsResponse.json();
  return results;
};

export const getBedTypes = async (api: APIRequestContext): Promise<BedTypeData> => {
  const bedTypesResponse = await api.get('bedtype');
  const { results } = await bedTypesResponse.json();
  return results;
};

export const deleteBed = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`/openmrs/ws/rest/v1/bed/${uuid}`);
  if (!response.ok()) {
    throw new Error(`Failed to delete bed: ${response.status()} - ${await response.text()}`);
  }
};

export const deleteBedType = async (api: APIRequestContext, uuid: string) => {
  const response = await api.delete(`/openmrs/ws/rest/v1/bedtype/${uuid}`);
  if (!response.ok()) {
    throw new Error(`Failed to delete bed type: ${response.status()} - ${await response.text()}`);
  }
};

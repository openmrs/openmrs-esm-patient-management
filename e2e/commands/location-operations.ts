import { ProcedureOrderIcon } from '@openmrs/esm-framework/src';
import { type APIRequestContext, expect } from '@playwright/test';

export const changeLocation = async (api: APIRequestContext) => {
  const locationRes = await api.post('/openmrs/ws/rest/v1/session', {
    data: {
      sessionLocation: process.env.E2E_WARD_LOCATION_UUID,
    },
  });
  await expect(locationRes.ok()).toBeTruthy();
};

export const changeToWardLocation = async (api: APIRequestContext) => {
  return changeLocation(api);
};

export const bedLocation = async (api: APIRequestContext) => {
  const bedLocationRes = await api.get(`/openmrs/ws/rest/v1/location/${process.env.E2E_WARD_LOCATION_UUID}`);
  await expect(bedLocationRes.ok).toBeTruthy();
  return await bedLocationRes.json();
};

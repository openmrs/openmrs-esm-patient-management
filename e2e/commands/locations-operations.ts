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

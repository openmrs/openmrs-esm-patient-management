import { type APIRequestContext, expect } from '@playwright/test';

export const changeLocation = async (api: APIRequestContext) => {
  const locationRes = await api.post('/openmrs/ws/rest/v1/session', {
    data: {
      sessionLocation: 'ba685651-ed3b-4e63-9b35-78893060758a',
    },
  });
  await expect(locationRes.ok()).toBeTruthy();
};

export const changeToWardLocation = async (api: APIRequestContext) => {
  return changeLocation(api);
};

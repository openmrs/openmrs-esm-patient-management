import { type APIRequestContext, expect } from '@playwright/test';

export const changeLocation = async (api: APIRequestContext, locationUuid: string) => {
  const locationRes = await api.post('session', {
    data: {
      sessionLocation: locationUuid,
    },
  });
  await expect(locationRes.ok()).toBeTruthy();
};

export const changeToWardLocation = async (api: APIRequestContext) => {
  return changeLocation(api, process.env.E2E_WARD_LOCATION_UUID as string);
};

export const changeToDefaultLocation = async (api: APIRequestContext) => {
  return changeLocation(api, process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID as string);
};

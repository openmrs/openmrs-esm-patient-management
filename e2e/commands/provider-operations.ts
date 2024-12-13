import { type APIRequestContext, expect } from '@playwright/test';
import { type Provider } from '../types';

export const getProvider = async (api: APIRequestContext): Promise<Provider> => {
  const providerRes = await api.get('provider?q=admin', {
    data: {},
  });
  await expect(providerRes.ok()).toBeTruthy();
  const { results } = await providerRes.json();
  return await results[0];
};

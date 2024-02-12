import { Provider } from '../../packages/esm-appointments-app/src/types/index';
import { APIRequestContext, expect } from '@playwright/test';

export const getProvider = async (api: APIRequestContext): Promise<Provider> => {
  try {
    const response = await api.get('provider?q=admin', {
      data: {},
    });
    // Ensure the response is successful
    if (!response.ok()) {
      throw new Error('Failed to fetch provider');
    }
    const { results } = await response.json();
    // Ensure there's at least one provider returned
    if (!results || results.length === 0) {
      throw new Error('No provider found');
    }
    // Return the first provider
    return results[0];
  } catch (error) {
    console.error('Error while fetching provider:', error);
    throw error; // Propagate the error to the caller
  }
};

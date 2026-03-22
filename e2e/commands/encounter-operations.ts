import dayjs from 'dayjs';
import { type APIRequestContext, type Page, expect } from '@playwright/test';
import { type Encounter } from './types';

export const createEncounter = async (
  api: APIRequestContext,
  patientId: string,
  providerId: string,
  note?: string,
): Promise<Encounter> => {
  const observations = [];

  if (note) {
    observations.push({
      concept: {
        uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: '',
      },
      value: note,
    });
  }
  const encounterRes = await api.post('encounter', {
    data: {
      encounterDatetime: dayjs().format(),
      form: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      patient: patientId,
      encounterProviders: [
        {
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          provider: providerId,
        },
      ],
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      encounterType: process.env.E2E_ADMISSION_ENCOUNTER_TYPE_UUID,
      obs: observations,
    },
  });
  expect(encounterRes.ok()).toBeTruthy();
  return await encounterRes.json();
};

export const generateWardAdmissionRequest = async (
  api: APIRequestContext,
  providerId: string,
  patientId: string,
): Promise<Encounter> => {
  const formRes = await api.post('encounter', {
    data: {
      patient: patientId,
      encounterDatetime: dayjs().format(),
      location: process.env.E2E_WARD_LOCATION_UUID,
      encounterType: process.env.E2E_ADMISSION_ENCOUNTER_TYPE_UUID,
      encounterProviders: [
        {
          provider: providerId,
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
        },
      ],
      obs: [
        {
          groupMembers: [
            {
              value: '77eafb3f-58d3-4397-a6dc-d2c06e9062f3',
              concept: 'ce085d74-323c-4c9a-9fdf-051de81dd020',
              formFieldNamespace: 'rfe-forms',
              formFieldPath: 'rfe-forms-disposition',
            },
            {
              value: 'ba685651-ed3b-4e63-9b35-78893060758a',
              concept: 'b9cd9e47-da43-4a46-8f3c-e30ec9209cc7',
              formFieldNamespace: 'rfe-forms',
              formFieldPath: 'rfe-forms-admitToLocation',
            },
          ],
          concept: '9ceedfb7-60e4-42ce-a11e-f2dbabc82112',
          formFieldNamespace: 'rfe-forms',
          formFieldPath: 'rfe-forms-inpatientDispositionConstruct',
        },
      ],
      form: {
        uuid: 'c4efe3f7-a556-3377-bc69-cae193418ebd',
      },
      orders: [],
      diagnoses: [],
    },
  });
  expect(formRes.ok()).toBeTruthy();
  const encounter = await formRes.json();
  return encounter;
};

export const createBedAssignmentEncounter = async (
  api: APIRequestContext,
  providerId: string,
  patientId: string,
  visit: string,
): Promise<Encounter> => {
  const formRes = await api.post('encounter', {
    data: {
      patient: patientId,
      location: process.env.E2E_WARD_LOCATION_UUID,
      encounterType: 'b2c4d5e6-7f8a-4e9b-8c1d-2e3f8e4a3b8f',
      encounterProviders: [
        {
          provider: providerId,
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
        },
      ],
      obs: [],
      visit: visit,
    },
  });
  expect(formRes.ok()).toBeTruthy();
  const encounter = await formRes.json();
  return encounter;
};

export const deleteEncounter = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`encounter/${uuid}`);
};

/**
 * Waits for an admission encounter to be fully processed into an InpatientAdmission.
 * This is necessary because after creating an admission encounter, the backend needs
 * time to process it into an InpatientAdmission. The UI uses SWR for data fetching, which
 * has its own cache refresh cycle. This function ensures both the API and UI are ready.
 *
 * @param api - The Playwright API request context
 * @param page - The Playwright page object (for waitForTimeout)
 * @param patientUuid - The UUID of the patient to check for
 * @param wardLocationUuid - The UUID of the ward location
 * @param options - Optional configuration
 * @param options.maxAttempts - Maximum number of polling attempts (default: 30)
 * @param options.delayMs - Delay between polling attempts in milliseconds (default: 2000)
 * @param options.uiCacheRefreshDelayMs - Time to wait after API confirmation for UI cache refresh (default: 3000)
 */
export const waitForAdmissionToBeProcessed = async (
  api: APIRequestContext,
  page: Page,
  patientUuid: string,
  wardLocationUuid: string,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    uiCacheRefreshDelayMs?: number;
  } = {},
): Promise<void> => {
  const { maxAttempts = 10, delayMs = 1000, uiCacheRefreshDelayMs = 0 } = options;

  let admissionFound = false;
  let lastResponse: any = null;

  // eslint-disable-next-line playwright/no-conditional-in-test
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await api.get(`emrapi/inpatient/admission?currentInpatientLocation=${wardLocationUuid}`);

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (response.ok()) {
      const data = await response.json();
      // eslint-disable-next-line playwright/no-conditional-in-test
      const results = data.results || [];
      lastResponse = { results, totalResults: results.length };

      // Check that the admission exists for this patient with visit data
      // The admission may have patient at top level or nested in visit
      admissionFound = results.some((admission: any) => {
        const admissionPatientUuid = admission.patient?.uuid || admission.visit?.patient?.uuid;
        return admissionPatientUuid === patientUuid && admission.visit?.uuid;
      });

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (admissionFound) {
        break;
      }
    } else {
      lastResponse = { status: response.status(), statusText: response.statusText() };
    }

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (attempt < maxAttempts - 1) {
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(delayMs);
    }
  }

  // eslint-disable-next-line playwright/no-conditional-in-test
  if (!admissionFound) {
    // eslint-disable-next-line playwright/no-conditional-in-test
    const debugInfo = lastResponse
      ? ` Last API response: ${JSON.stringify(lastResponse)}`
      : ' No successful API responses received.';
    throw new Error(
      `Admission for patient ${patientUuid} not found in emrapi API after ${maxAttempts} attempts (${maxAttempts * delayMs}ms).${debugInfo} ` +
        `This may indicate: (1) emrapi configuration issue, (2) encounter type mismatch, or (3) backend processing delay.`,
    );
  }

  // Give the UI time to refresh its SWR cache with the updated admission data
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(uiCacheRefreshDelayMs);
};

/**
 * Waits for an inpatient admission request to be available via EMR API.
 * This is used after creating an admission request encounter so the UI can render it.
 */
export const waitForAdmissionRequestToBeProcessed = async (
  api: APIRequestContext,
  page: Page,
  patientUuid: string,
  wardLocationUuid: string,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    uiCacheRefreshDelayMs?: number;
  } = {},
): Promise<void> => {
  const { maxAttempts = 30, delayMs = 2000, uiCacheRefreshDelayMs = 3000 } = options;

  let requestFound = false;
  let lastResponse: any = null;

  // eslint-disable-next-line playwright/no-conditional-in-test
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await api.get(
      `emrapi/inpatient/request?dispositionType=ADMIT,TRANSFER&dispositionLocation=${wardLocationUuid}`,
    );

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (response.ok()) {
      const data = await response.json();
      const results = data.results || [];
      lastResponse = { results, totalResults: results.length };

      requestFound = results.some((request: any) => {
        const requestPatientUuid = request.patient?.uuid || request.visit?.patient?.uuid;
        return requestPatientUuid === patientUuid;
      });

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (requestFound) {
        break;
      }
    } else {
      lastResponse = { status: response.status(), statusText: response.statusText() };
    }

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (attempt < maxAttempts - 1) {
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(delayMs);
    }
  }

  // eslint-disable-next-line playwright/no-conditional-in-test
  if (!requestFound) {
    // eslint-disable-next-line playwright/no-conditional-in-test
    const debugInfo = lastResponse
      ? ` Last API response: ${JSON.stringify(lastResponse)}`
      : ' No successful API responses received.';
    throw new Error(
      `Admission request for patient ${patientUuid} not found in emrapi API after ${maxAttempts} attempts (${maxAttempts * delayMs}ms).${debugInfo} ` +
        `This may indicate: (1) emrapi configuration issue, (2) encounter type mismatch, or (3) backend processing delay.`,
    );
  }

  // Give the UI time to refresh its SWR cache with the updated request data
  // eslint-disable-next-line playwright/no-wait-for-timeout
  await page.waitForTimeout(uiCacheRefreshDelayMs);
};

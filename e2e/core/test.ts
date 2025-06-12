import { type APIRequestContext, type Page, test as base } from '@playwright/test';
import { api } from '../fixtures';
import { type Patient } from '../types';
import { generateRandomPatient, deletePatient, startVisit, endVisit } from '../commands';
import { type Visit } from '@openmrs/esm-framework';

// This file sets up our custom test harness using the custom fixtures.
// See https://playwright.dev/docs/test-fixtures#creating-a-fixture for details.
// If a spec intends to use one of the custom fixtures, the special `test` function
// exported from this file must be used instead of the default `test` function
// provided by playwright.

export interface CustomTestFixtures {
  loginAsAdmin: Page;
  patient: Patient;
  visit?: Visit;
}

export interface CustomWorkerFixtures {
  api: APIRequestContext;
}

export const test = base.extend<CustomTestFixtures, CustomWorkerFixtures>({
  api: [api, { scope: 'worker' }],
  patient: [
    async ({ api }, use) => {
      const patient = await generateRandomPatient(api);
      await use(patient);
      try {
        if (patient) await deletePatient(api, patient.uuid);
      } catch (e) {
        console.warn('Failed to delete patient:', e);
      }
    },
    { scope: 'test', auto: true },
  ],

  visit: [
    async ({ api, patient }, use) => {
      const visit = await startVisit(api, patient.uuid);
      await use(visit);
      try {
        if (visit) await endVisit(api, visit.uuid);
      } catch (e) {
        console.warn('Failed to end visit:', e);
      }
    },
    { scope: 'test', auto: true },
  ],
});

test.afterEach(async ({ api, patient, visit }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    try {
      if (visit?.uuid) await endVisit(api, visit.uuid);
    } catch (e) {
      console.warn('Failed to end visit during cleanup:', e);
    }

    try {
      if (patient?.uuid) await deletePatient(api, patient.uuid);
    } catch (e) {
      console.warn('Failed to delete patient during cleanup:', e);
    }
  }
});

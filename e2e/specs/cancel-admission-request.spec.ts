import { expect } from '@playwright/test';
import { test } from '../core';
import {
  endVisit,
  startVisit,
  changeToWardLocation,
  generateRandomPatient,
  getProvider,
  generateWarAdmission,
  deletePatient,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Patient, type Encounter, type Provider } from '../types';
import { generateBedType, generateRandomBed } from '../commands/bed-operations';

let visit: Visit;
let wardPatient: Patient;
let ecounter: Encounter;
let provider: Provider;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  await generateBedType(api);
  await generateRandomBed(api);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  ecounter = await generateWarAdmission(api, provider.uuid, wardPatient.uuid);
});

test('Cancelling an admission request', async ({ page }) => {
  const fullName = wardPatient.person?.display;

  await test.step('When I visit the patient ward page', async () => {
    await page.goto(process.env.E2E_BASE_URL + `/spa/home/ward`);
  });

  await test.step('And I click the "Manage" button to view admission requests', async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
  });

  await test.step('Then I verify the patient is listed in admission requests', async () => {
    await expect(page.getByText(fullName)).toBeVisible();
  });

  await test.step('And I click the "Cancel" button for the patient', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  await test.step('And I add admission notes', async () => {
    await page.getByRole('textbox').fill('This patient admission is being cancelled');
  });

  await test.step('And I confirm admission by clicking "Save"', async () => {
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await test.step('Then I see the success message confirms admission cancelled', async () => {
    await expect(page.getByText(/admission request cancelled/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

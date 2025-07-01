/* eslint-disable no-console */
import { expect } from '@playwright/test';
import { test } from '../core';
import {
  endVisit,
  startVisit,
  changeToWardLocation,
  generateRandomPatient,
  getProvider,
  generateWardAdmission,
  deletePatient,
  inWardAdmission,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Patient, type Encounter, type Provider } from '../types';
import { bedAllocation, generateBedType, generateRandomBed } from '../commands/bed-operations';

let visit: Visit;
let wardPatient: Patient;
let clinicalEcounter: Encounter;
let inwardEcounter: Encounter;
let provider: Provider;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  await generateBedType(api);
  await generateRandomBed(api);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient?.uuid, process.env.E2E_WARD_LOCATION_UUID);
  clinicalEcounter = await generateWardAdmission(api, provider.uuid, wardPatient?.uuid);
  inwardEcounter = await inWardAdmission(api, provider.uuid, wardPatient.uuid, visit?.uuid);
  await bedAllocation(api, wardPatient?.uuid, inwardEcounter?.uuid);
});

test('Cancelling an admission request', async ({ page }) => {
  const fullName = wardPatient.person?.display;

  await test.step('When I visit the patient ward page', async () => {
    await page.goto(process.env.E2E_BASE_URL + `/spa/home/ward`);
  });

  await test.step('And I click the "Manage" button to view admission requests', async () => {
    console.log(fullName);
    await page
      .locator('[id="single-spa-application\\:\\@openmrs\\/esm-home-app-page-0"]')
      .getByRole('button')
      .nth(1)
      .click();
  });

  await test.step('Then I click on patient notes button', async () => {
    await page.getByRole('button', { name: 'Patient Note' }).click();
  });

  await test.step('And I add patient notes', async () => {
    await page.getByRole('textbox', { name: 'Write your notes' }).click();
    await page.getByRole('textbox', { name: 'Write your notes' }).fill('patient notes');
  });

  await test.step('And I confirm admission by clicking "Save"', async () => {
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await test.step('Then I see the success message confirms patient note saved', async () => {
    await expect(page.getByText(/patient note saved/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

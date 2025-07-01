import { expect } from '@playwright/test';
import { test } from '../core';
import {
  endVisit,
  startVisit,
  changeToWardLocation,
  generateRandomPatient,
  getProvider,
  generateWarAdmission,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Patient, type Encounter, type Provider } from '../types';

let visit: Visit;
let wardPatient: Patient;
let ecounter: Encounter;
let provider: Provider;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  ecounter = await generateWarAdmission(api, provider.uuid, wardPatient.uuid);
});

test('Confirming patient is admitted to ward', async ({ page }) => {
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

  await test.step('And I click the "Admit patient" button for the patient', async () => {
    await page.getByRole('button', { name: 'Admit patient' }).first().click();
  });

  await test.step('And I select the ward/location for admission', async () => {
    await page.getByRole('group').locator('span').nth(2).click();
  });

  await test.step('And I confirm admission by clicking "Admit"', async () => {
    await page.getByRole('button', { name: 'Admit' }).click();
  });

  await test.step('Then I see the success message confirms admission', async () => {
    await expect(page.getByText(new RegExp(`${fullName}\\s+has been successfully admitted`))).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid, true);
});

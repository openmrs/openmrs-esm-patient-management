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
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Patient, type Encounter, type Provider, type Bed, type BedType } from '../types';
import { deleteBed, deleteBedType, generateBedType, generateRandomBed } from '../commands/bed-operations';

let visit: Visit;
let wardPatient: Patient;
let encounter: Encounter;
let provider: Provider;
let bed: Bed;
let bedtype: BedType;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  bedtype = await generateBedType(api);
  bed = await generateRandomBed(api, bedtype);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  encounter = await generateWardAdmission(api, provider.uuid, wardPatient.uuid);
});

test('Cancelling an admission request', async ({ page }) => {
  const fullName = wardPatient.person?.display;

  await test.step('When I visit the patient ward page', async () => {
    await page.goto(`/openmrs/spa/home/ward`);
  });

  await test.step('And I click the "Manage" button to view admission requests', async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
  });

  await test.step('Then I should see an admission request for the patient', async () => {
    await expect(page.getByText(fullName)).toBeVisible();
  });

  await test.step('And when I click the "Cancel" button to cancel the request', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  await test.step('Then I should see the "Cancel admission request" form launched in the workspace', async () => {
    await expect(page.getByText('Cancel admission request')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Clinical notes' })).toBeVisible();
  });

  await test.step('And I enter a reason for cancellation in the "Admission notes" field', async () => {
    await page.getByRole('textbox').fill('This patient admission is being cancelled');
  });

  await test.step('And I click the "Save" button to submit the form', async () => {
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await test.step('Then I should see a success notification confirming the admission was cancelled', async () => {
    await expect(page.getByText(/admission request cancelled/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  //We are waiting for the backend fix on https://bahmni.atlassian.net/browse/BAH-4197 to be able to delete beds
  // await deleteBed(api, bed.uuid);
  // await deleteBedType(api, bedtype.uuid);
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

import { expect } from '@playwright/test';
import { test } from '../core';
import {
  changeToWardLocation,
  deletePatient,
  endVisit,
  generateRandomPatient,
  generateWardAdmissionRequest,
  getProvider,
  startVisit,
  waitForAdmissionRequestToBeProcessed,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType, type Patient, type Provider } from '../commands/types';
import { deleteBed, generateBedType, generateRandomBed, retireBedType } from '../commands/bed-operations';
import { WardPage } from '../pages';

let bed: Bed;
let bedtype: BedType;
let provider: Provider;
let visit: Visit;
let wardPatient: Patient;

test.beforeEach(async ({ api, page }) => {
  await changeToWardLocation(api);
  bedtype = await generateBedType(api);
  bed = await generateRandomBed(api, bedtype);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  await generateWardAdmissionRequest(api, provider.uuid, wardPatient.uuid);
  await waitForAdmissionRequestToBeProcessed(api, page, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID as string);
});

test('Cancel an admission request', async ({ page }) => {
  const wardPage = new WardPage(page);
  const fullName = wardPatient.person?.display;

  await test.step('When I visit the patient ward page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I click the "Manage" button to view admission requests', async () => {
    await wardPage.clickManageAdmissionRequests();
  });

  await test.step('Then I should see a pending admission request for the patient', async () => {
    await expect(page.getByText(fullName)).toBeVisible();
  });

  await test.step('And when I click the "Cancel" button to cancel the request', async () => {
    await wardPage.clickCancelAdmissionButton(fullName);
  });

  await test.step('Then I should see the "Cancel admission request" form launched in the workspace', async () => {
    await expect(wardPage.cancelAdmissionRequestHeading()).toBeVisible();
    await expect(wardPage.clinicalNotesField()).toBeVisible();
  });

  await test.step('And I enter a reason for cancellation in the "Clinical notes" field', async () => {
    await wardPage.clinicalNotesField().fill('This patient admission is being cancelled');
  });

  await test.step('And I click the "Save" button to submit the form', async () => {
    await wardPage.clickSaveButton();
  });

  await test.step('Then I should see a success notification confirming the admission was cancelled', async () => {
    await wardPage.expectAdmissionRequestCancelled();
  });
});

test.afterEach(async ({ api }) => {
  await deleteBed(api, bed);
  await retireBedType(api, bedtype.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

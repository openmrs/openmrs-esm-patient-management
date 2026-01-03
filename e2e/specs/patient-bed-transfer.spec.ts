import { type Visit } from '@openmrs/esm-framework/src';
import { type Bed, type BedType, type Patient, type Provider } from '../commands/types';
import { test } from '../core';
import {
  changeLocation,
  changeToWardLocation,
  deletePatient,
  dischargePatientFromBed,
  endVisit,
  generateBedType,
  generateRandomBed,
  generateRandomPatient,
  generateWardAdmissionRequest,
  getProvider,
  retireBedType,
  startVisit,
} from '../commands';
import { WardPage } from '../pages';
import { expect, type Page } from '@playwright/test';

let bed: Bed;
let bedtype: BedType;
let provider: Provider;
let transferBed: Bed;
let visit: Visit;
let wardPatient: Patient;
let fullName: string;

async function selectBedByLabel(page: Page, label: string) {
  try {
    await page.getByRole('radio', { name: label }).waitFor({ state: 'visible', timeout: 2000 });
    await page.locator('label.cds--radio-button__label', { hasText: label }).click();
  } catch {
    await page.getByRole('combobox', { name: /choose an option/i }).click();
    await page.getByRole('option', { name: label }).click();
  }
}

test.beforeAll(async ({ api }) => {
  await changeLocation(api, process.env.E2E_WARD1_LOCATION_UUID);
  bedtype = await generateBedType(api);
  bed = await generateRandomBed(api, bedtype, process.env.E2E_WARD1_LOCATION_UUID);
  provider = await getProvider(api);
  transferBed = await generateRandomBed(api, bedtype, process.env.E2E_WARD1_LOCATION_UUID);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD1_LOCATION_UUID);
  fullName = wardPatient.person?.display;
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD1_LOCATION_UUID);
  await generateWardAdmissionRequest(api, provider.uuid, wardPatient.uuid, process.env.E2E_WARD1_LOCATION_UUID);
});

test('Transfer a patient from one bed to another', async ({ page }) => {
  const wardPage = new WardPage(page);

  await test.step('When I visit the patient ward page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I admit a patient to Inpatient Ward', async () => {
    await wardPage.manageAdmissionRequestsButton().click();
    await wardPage.waitForAdmissionRequest(fullName);
    await wardPage.clickAdmitPatientButton(fullName);

    await selectBedByLabel(page, `${bed.bedNumber} · Empty`);

    await page.locator('button[type="submit"]', { hasText: 'Admit' }).click();
  });

  await test.step('Then I should see a success admission message', async () => {
    await expect(
      page.getByText(new RegExp(`${fullName}\\s+has been successfully admitted and assigned to bed ${bed.bedNumber}`)),
    ).toBeVisible();
  });

  await test.step('And I click the admitted patient card', async () => {
    await wardPage.clickPatientCard(fullName);
  });

  await test.step('And I click the transfer button', async () => {
    await expect(wardPage.transferButton()).toBeVisible({ timeout: 10000 });
    await wardPage.transferButton().click();
  });

  await test.step('And I select Inpatient Ward as transfer location', async () => {
    await wardPage.searchLocationInput().fill('Inpatient Ward');
    await page.getByRole('radio', { name: 'Ward 1' }).click();
  });

  await test.step('And I click save to complete the ward transfer', async () => {
    await wardPage.saveButton().click();
  });

  await test.step('Then I should see a success message confirming the transfer', async () => {
    await expect(page.getByText('Patient transfer request created')).toBeVisible();
  });
});

test('Admit a transferred patient to a new bed', async ({ page, api }) => {
  await changeLocation(api, process.env.E2E_WARD_LOCATION_UUID);

  const wardPage = new WardPage(page);
  await test.step('When I visit the patient ward page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I click "Manage" to view admission requests', async () => {
    await wardPage.clickManageAdmissionRequests();
  });

  await test.step('Then I should see the transferred patient', async () => {
    await wardPage.waitForAdmissionRequest(fullName);
    await expect(page.getByText(fullName)).toBeVisible();
  });

  await test.step('And I click "Admit patient"', async () => {
    await wardPage.clickAdmitPatientButton(fullName);
  });

  await test.step('And I select a new bed', async () => {
    await selectBedByLabel(page, `${transferBed.bedNumber} · Empty`);
    await page.getByRole('button', { name: 'Admit' }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(
      page.getByText(
        new RegExp(`${fullName}\\s+has been successfully admitted and assigned to bed ${transferBed.bedNumber}`),
      ),
    ).toBeVisible();
  });
});

test.afterAll(async ({ api }) => {
  await dischargePatientFromBed(api, transferBed.id, wardPatient.uuid);
  await retireBedType(api, bedtype.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

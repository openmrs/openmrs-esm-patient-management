import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { Visit } from '@openmrs/esm-framework';
import {
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
  waitForAdmissionRequestToBeProcessed,
  waitForAdmissionToBeProcessed,
} from '../commands';
import type { Bed, BedType, Patient, Provider } from '../commands/types';
import { test } from '../core';
import { WardPage } from '../pages';

async function selectBedByLabel(page: Page, label: string) {
  // Try radio button first (for fewer beds), fall back to dropdown (for many beds)
  try {
    await page.getByRole('radio', { name: label }).waitFor({ state: 'visible', timeout: 2000 });
    // Click the Carbon label to avoid overlay interception
    await page.locator('label.cds--radio-button__label', { hasText: label }).click();
  } catch {
    // Use dropdown if radio not found
    await page.getByRole('combobox', { name: /choose an option/i }).click();
    await page.getByRole('option', { name: label }).click();
  }
}

let bed: Bed;
let bedtype: BedType;
let provider: Provider;
let swapBed: Bed;
let visit: Visit;
let wardPatient: Patient;

test.beforeEach(async ({ api, page }) => {
  await changeToWardLocation(api);
  bedtype = await generateBedType(api);
  bed = await generateRandomBed(api, bedtype);
  swapBed = await generateRandomBed(api, bedtype); // Generate the bed we'll swap to
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  await generateWardAdmissionRequest(api, provider.uuid, wardPatient.uuid);
  await waitForAdmissionRequestToBeProcessed(api, page, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID as string);
});

test('Swap a patient from one bed to another', async ({ page, api }) => {
  const wardPage = new WardPage(page);
  const fullName = wardPatient.person?.display;

  await test.step('When I visit the patient ward page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I click the "Manage" button to view pending admission requests', async () => {
    await wardPage.clickManageAdmissionRequests();
  });

  await test.step('Then I should see the patient in the pending admission requests list', async () => {
    await wardPage.waitForAdmissionRequest(fullName);
    await expect(page.getByText(fullName)).toBeVisible();
  });

  await test.step('And I click the "Admit patient" button for the patient', async () => {
    await wardPage.clickAdmitPatientButton(fullName);
  });

  await test.step('And I select a bed to assign to the patient', async () => {
    await selectBedByLabel(page, `${bed.bedNumber} · Empty`);
  });

  await test.step('And I confirm admission by clicking "Admit"', async () => {
    await page.getByRole('button', { name: 'Admit', exact: true }).click();
  });

  await test.step('Then I should see a success message confirming the patient was admitted and assigned to bed', async () => {
    await expect(
      page.getByText(new RegExp(`${fullName}\\s+has been successfully admitted and assigned to bed ${bed.bedNumber}`)),
    ).toBeVisible();
  });

  await test.step('And I should see the patient in the ward view', async () => {
    await wardPage.waitForPatientInWardView(fullName);
  });

  await test.step('And I wait for the admission to be available in the API', async () => {
    await waitForAdmissionToBeProcessed(api, page, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  });

  await test.step('And I click on the patient card to open the ward patient workspace', async () => {
    await wardPage.clickPatientCard(fullName);
  });

  await test.step('Then I see the "Transfers" button in the siderail', async () => {
    await expect(wardPage.transferButton()).toBeVisible({ timeout: 10000 });
  });

  await test.step('And I click the "Transfers" button to open the transfer workspace', async () => {
    await wardPage.transferButton().click();
  });

  await test.step('And I click the "Bed swap" tab', async () => {
    await wardPage.swapButton().click();
  });

  await test.step('And I select the destination bed', async () => {
    await selectBedByLabel(page, `${swapBed.bedNumber} · Empty`);
  });

  await test.step('And I click "Save" to complete the bed swap', async () => {
    await wardPage.saveButton().click();
  });

  await test.step('Then I should see a success notification confirming the bed swap', async () => {
    await expect(page.getByText(/patient assigned to new bed/i)).toBeVisible();
    await expect(page.getByText(new RegExp(`${fullName}.*assigned to bed ${swapBed.bedNumber}`))).toBeVisible();
  });

  await test.step('And the patient should be in the new bed', async () => {
    await wardPage.waitForPatientInWardView(fullName);
  });

  await test.step('And the original bed should be empty', async () => {
    const originalBedLocator = page.locator('[class*="emptyBed"]').filter({
      has: page.locator('span[class*="wardPatientBedNumber"]', { hasText: new RegExp(`^${bed.bedNumber}$`) }),
    });
    await expect(originalBedLocator.getByText(/empty bed/i)).toBeVisible({ timeout: 60000 });
  });
});

test.afterEach(async ({ api }) => {
  await dischargePatientFromBed(api, swapBed.id, wardPatient.uuid);
  await retireBedType(api, bedtype.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

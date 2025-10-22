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
  generateWardAdmission,
  getProvider,
  retireBedType,
  startVisit,
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

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  bedtype = await generateBedType(api);
  bed = await generateRandomBed(api, bedtype);
  swapBed = await generateRandomBed(api, bedtype); // Generate the bed we'll swap to
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  await generateWardAdmission(api, provider.uuid, wardPatient.uuid);
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

  await test.step('And I select the bed for admission', async () => {
    await selectBedByLabel(page, `${bed.bedNumber} · Empty`);
  });

  await test.step('And I confirm admission by clicking "Admit"', async () => {
    await page.getByRole('button', { name: 'Admit' }).click();
  });

  await test.step('Then I should see a success message confirming the admission success', async () => {
    await expect(
      page.getByText(new RegExp(`${fullName}\\s+has been successfully admitted and assigned to bed ${bed.bedNumber}`)),
    ).toBeVisible();
  });

  // Poll the admission API to verify the patient's visit data is available before the UI loads ward data.
  // This prevents race conditions where the UI caches incomplete admission data before the backend has fully indexed it.
  const maxAttempts = 10;
  const delayMs = 1000;
  let admissionIndexed = false;

  // eslint-disable-next-line playwright/no-conditional-in-test
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const admissionResponse = await api.get(
      `emrapi/inpatient/admission?currentInpatientLocation=${process.env.E2E_WARD_LOCATION_UUID}`,
    );

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (admissionResponse.ok()) {
      const data = await admissionResponse.json();
      // eslint-disable-next-line playwright/no-conditional-in-test
      const results = data.results || [];
      admissionIndexed = results.some(
        (admission) => admission.visit?.patient?.uuid === wardPatient.uuid && admission.visit?.uuid,
      );

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (admissionIndexed) {
        break;
      }
    }

    // eslint-disable-next-line playwright/no-conditional-in-test
    if (attempt < maxAttempts - 1) {
      // eslint-disable-next-line playwright/no-wait-for-timeout
      await page.waitForTimeout(delayMs);
    }
  }

  // eslint-disable-next-line playwright/no-conditional-in-test
  if (!admissionIndexed) {
    throw new Error(
      `Admission for patient ${wardPatient.uuid} not fully indexed after ${maxAttempts} attempts. Visit data may be missing.`,
    );
  }

  await test.step('And I should see the patient in the ward view', async () => {
    await wardPage.waitForPatientInWardView(fullName);
  });

  await test.step('And I click on the patient card to open the ward patient workspace', async () => {
    await wardPage.clickPatientCard(fullName);
  });

  await test.step('And I swap the patient from the original bed to the destination bed', async () => {
    await wardPage.transferButton().click();
    await wardPage.swapButton().click();
    await selectBedByLabel(page, `${swapBed.bedNumber} · Empty`);
    await wardPage.saveButton().click();
  });

  await test.step('Then I should see a success notification confirming the bed swap', async () => {
    await expect(page.getByText(/patient assigned to new bed/i)).toBeVisible();
    await expect(page.getByText(new RegExp(`${fullName}.*assigned to bed ${swapBed.bedNumber}`))).toBeVisible();
  });

  await test.step('And the patient should be in the new bed', async () => {
    await wardPage.waitForPatientInWardView(fullName);
    await expect(page.getByText(fullName, { exact: true })).toBeVisible();
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

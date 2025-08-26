import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType, type Encounter, type Patient, type Provider } from '../commands/types';
import {
  changeToWardLocation,
  changeToDefaultLocation,
  deleteBed,
  dischargePatientFromBed,
  deletePatient,
  endVisit,
  generateBedType,
  generateRandomBed,
  generateRandomPatient,
  generateWardAdmission,
  getProvider,
  startVisit,
  retireBedType,
} from '../commands';
import { test } from '../core';
import { WardPage } from '../pages';

let bed: Bed;
let bedType: BedType;
let encounter: Encounter;
let provider: Provider;
let visit: Visit;
let wardPatient: Patient;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  bedType = await generateBedType(api);
  bed = await generateRandomBed(api, bedType);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  encounter = await generateWardAdmission(api, provider.uuid, wardPatient.uuid);
});

test('Discharge a patient from a ward', async ({ page, api }) => {
  const wardPage = new WardPage(page);
  const patientName = wardPatient.person?.display;

  await test.step('When I open the Ward page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I navigate to Ward Management', async () => {
    await expect(page.getByRole('link', { name: /Wards/i })).toBeVisible();
    await page.getByRole('link', { name: /Wards/i }).click();
  });

  await test.step("Then I see the 'Inpatient Ward' heading", async () => {
    await expect(page.getByRole('heading', { name: 'Inpatient Ward' })).toBeVisible();
  });

  await test.step("And I click Manage to view 'Admission requests'", async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
  });

  await test.step("Then I see the patient in 'Admission requests'", async () => {
    const admissionCardsForPatient = page.locator('[class*="admissionRequestCard"]').filter({ hasText: patientName });
    await expect(admissionCardsForPatient.first()).toBeVisible();
  });

  await test.step("And I click 'Admit patient'", async () => {
    await wardPage.clickAdmitPatientButton(patientName);
  });

  await test.step('And I select the bed for admission', async () => {
    await page.getByText(`${bed.bedNumber} · Empty`).click();
  });

  await test.step('And I admit the patient', async () => {
    await page.getByRole('button', { name: /Admit/i }).click();
  });

  await test.step('Then I see an admission success message', async () => {
    await expect(page.getByText(/Patient admitted/i)).toBeVisible();
  });

  await test.step('Then I see the patient in the ward', async () => {
    await expect(page.getByRole('heading', { name: 'Inpatient Ward' })).toBeVisible();
    await expect(page.getByText(patientName, { exact: true })).toBeVisible();
  });

  await test.step("And when I click the patient's card to open the patient workspace", async () => {
    await wardPage.clickPatientCard(patientName);
  });

  await test.step("Then I see the 'Discharge' button", async () => {
    await expect(page.getByRole('button', { name: 'Discharge' })).toBeVisible();
  });

  await test.step('And I discharge the patient', async () => {
    await page.getByRole('button', { name: 'Discharge' }).click();
  });

  await test.step('And I confirm the discharge', async () => {
    await page.getByRole('button', { name: 'Proceed with patient discharge' }).click();
  });

  await test.step('Then I should see a success message confirming the patient was discharged', async () => {
    await expect(page.getByText('Patient was discharged')).toBeVisible();
  });

  await test.step('And the patient should no longer be listed in the ward', async () => {
    await expect(page.getByText(patientName, { exact: true })).toBeHidden();
  });
});

test.afterEach(async ({ api }) => {
  await dischargePatientFromBed(api, bed.id, wardPatient.uuid);
  await retireBedType(api, bedType.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
  await changeToDefaultLocation(api);
});

import { expect } from '@playwright/test';
import { test } from '../core';
import { WardPage } from '../pages';
import { type Patient, type Encounter, type Provider, type Bed, type BedType } from '../types';
import { deleteBed, generateBedType, generateRandomBed } from '../commands/ward-operations';
import {
  generateRandomPatient,
  deletePatient,
  changeToWardLocation,
  startVisit,
  getProvider,
  endVisit,
  generateWardAdmission,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';

let visit: Visit;
let wardPatient: Patient;
let encounter: Encounter;
let provider: Provider;
let bed: Bed;
let bedType: BedType;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  bedType = await generateBedType(api);
  bed = await generateRandomBed(api);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  encounter = await generateWardAdmission(api, provider.uuid, wardPatient.uuid);
});

test('Discharge Patient From a Ward', async ({ page, api }) => {
  test.setTimeout(5 * 60 * 1000);
  const wardPage = new WardPage(page);
  const patientName = wardPatient.person?.display;
  await test.step('when I visit the ward page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I navigate to ward management', async () => {
    await expect(page.getByRole('link', { name: 'wards' })).toBeVisible();
    await page.getByRole('link', { name: 'wards' }).click();
  });
  await test.step('Then I should see the "In patient Ward" heading', async () => {
    await expect(page.getByRole('heading', { name: 'Inpatient Ward' })).toBeVisible();
  });

  await test.step('And I click the "Manage" button  to view the Admission request', async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
  });

  await test.step('Then I should see the patient in the "Admission request" workspace', async () => {
    await expect(page.locator(`text=${patientName}`)).toBeVisible();
  });

  await test.step('And I click the "Admit patient" button', async () => {
    await page.getByRole('button', { name: /Admit patient/i }).click();
  });
  await test.step('And I click the "Choose an option"combobox', async () => {
    await page.getByRole('combobox',{name: 'Choose an option'}).toBeVisible();
    await page.getByRole('combobox', { name: 'Choose an option' }).click();
  })
  await test.step('And I assign the patient to a bed', async () => {
    await expect(page.getByRole('heading', { name: 'Select a bed' })).toBeVisible();
    const emptyBedOption = page.getByText(/.*Empty$/).first();
    await emptyBedOption.click();
  });
  await test.step('And I click the "Admit" button to admit the patient', async () => {
    await page.getByRole('button', { name: /Admit/i }).click();
  });
  await test.step('Then I should see a success message that the patient has been admitted', async () => {
    await expect(page.getByText('Patient admitted successfull')).toBeVisible();
  });

  await test.step('Then I should see the patient in the ward', async () => {
    await expect(page.getByRole('heading', { name: 'Inpatient Ward' })).toBeVisible();
    await expect(page.getByText(patientName, { exact: true })).toBeVisible();
  });
  await test.step('And I click on the patient to view the Ward Patient workspace', async () => {
    const patientCard = page.locator('.-esm-ward__ward-patient-card__wardPatientCard___ST-Dh', {
      hasText: wardPatient.person.display,
    });
    await expect(patientCard).toBeVisible();
    await patientCard.click();
    await page.waitForLoadState('load');
  });
  await test.step('Then I should see the "Discharge" button on the side rail', async () => {
    await expect(page.getByRole('button', { name: 'Discharge' })).toBeVisible();
  });
  await test.step('And I click the "Discharge" button', async () => {
    await page.getByRole('button', { name: 'Discharge' }).click();
  });

  await test.step('And I click the "Proceed with patient discharge " button to discharge the patient', async () => {
    await page.getByRole('button', { name: 'Proceed with patient discharge' }).click();
  });
  await test.step('Then I should see a success message that the patient has been discharged', async () => {
    await expect(page.getByText('Patient was discharged')).toBeVisible();
  });
  await test.step('And I should see the patient is no longer in the ward', async () => {
    await expect(page.locator(`text=${patientName},exact:true`)).toBeHidden();
  });
});

test.afterEach(async ({ api }) => {
  await deleteBed(api, bed.uuid);
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid);
});

import { expect } from '@playwright/test';
import { test } from '../core';
import {
  changeToWardLocation,
  deletePatient,
  endVisit,
  generateRandomPatient,
  generateWardAdmission,
  getProvider,
  startVisit,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType, type Patient, type Provider } from '../commands/types';
import { dischargePatientFromBed, generateBedType, generateRandomBed, retireBedType } from '../commands/bed-operations';
import { WardPage } from '../pages';

let visit: Visit;
let wardPatient: Patient;
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
  await generateWardAdmission(api, provider.uuid, wardPatient.uuid);
});

test('Admit a patient to a ward from the admission requests list', async ({ page }) => {
  const fullName = wardPatient.person?.display;
  const wardPage = new WardPage(page);

  await test.step('When I visit the patient ward page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I click the "Manage" button to view admission requests', async () => {
    await wardPage.clickManageAdmissionRequests();
  });

  await test.step('Then I verify the patient is listed in admission requests', async () => {
    await expect(page.getByText(fullName)).toBeVisible();
  });

  await test.step('And I click the "Admit patient" button for the patient', async () => {
    await page.getByRole('button', { name: 'Admit patient' }).first().click();
  });

  await test.step('And I select the ward/location for admission', async () => {
    await page.getByText(`${bed.bedNumber} · Empty`).click();
  });

  await test.step('And I confirm admission by clicking "Admit"', async () => {
    await page.getByRole('button', { name: 'Admit' }).click();
  });

  await test.step('Then I see the success message confirms admission', async () => {
    await expect(
      page.getByText(new RegExp(`${fullName}\\s+has been successfully admitted and assigned to bed ${bed.bedNumber}`)),
    ).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await dischargePatientFromBed(api, bed.id, wardPatient.uuid);
  await retireBedType(api, bedtype.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

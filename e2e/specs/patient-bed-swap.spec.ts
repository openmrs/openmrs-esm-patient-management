import { type Location, type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType, type Patient, type Provider } from '../commands/types';
import { test } from '../core';
import {
  bedLocation,
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
import { PatientBedSwapPage } from '../pages/patient-bed-swap';
import { BedAdministrationPage } from '../pages/bed-administration-page';
import { WardPage } from '../pages';
import { expect } from '@playwright/test';
import { saveBed } from '../../packages/esm-bed-management-app/src/bed-administration/form/bed-form.resource';

let patient: Patient;
let location: Location;
let visit: Visit;
let bed: Bed;
let bedtype: BedType;
let provider: Provider;
let wardPatient: Patient;
let uniqueTagName1 = `Tag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
let uniqueTypeName1 = `Type_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
test.beforeEach(async ({ api }) => {
  location = await bedLocation(api);
  await changeToWardLocation(api);
  bedtype = await generateBedType(api);
  bed = await generateRandomBed(api, bedtype);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  await generateWardAdmission(api, provider.uuid, wardPatient.uuid);
});
test('Swap the patient to another bed', async ({ page }) => {
  const patientBedSwap = new PatientBedSwapPage(page);
  const bedAdministration = new BedAdministrationPage(page);
  const wardPage = new WardPage(page);
  await test.step('Admit a patient to  ward', async () => {
    await wardPage.goTo();
    await wardPage.clickManageAdmissionRequests();
    await page.getByRole('button', { name: 'Admit patient' }).first().click();
    await page.getByText(`${bed.bedNumber} · Empty`).click();
    await page.getByRole('button', { name: 'Admit' }).click();
  });

  await test.step('Then add a bed to the ward', async () => {
    await bedAdministration.openBedAdministration();
  });
  await test.step('And i will create a bed tag for the bed', async () => {
    await bedAdministration.openBedTags();
    let uniqueTagName1 = `Tag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await page.getByRole('button', { name: /create bed tag/i }).click();
    await bedAdministration.bedTagNameInput().fill(uniqueTagName1);
    await bedAdministration.saveButton().click();
  });
  await test.step('And i will create bed type for the bed', async () => {
    await bedAdministration.openBedTypes();

    const displayName1 = uniqueTypeName1.slice(0, 10);
    const description1 = `E2E ${uniqueTypeName1}`;
    await page.getByRole('button', { name: /add bed type/i }).click();
    await bedAdministration.bedNameInput().fill(uniqueTypeName1);
    await bedAdministration.displayNameInput().fill(displayName1);
    await bedAdministration.descriptionInput().fill(description1);
    await bedAdministration.saveButton().click();
  });

  await test.step('And i will create a bed', async () => {
    await bedAdministration.openBedAdministration();
    await page.getByRole('button', { name: /Add bed/i }).click();
    const bedNumber = `B_${Date.now().toString().slice(-6)}`.slice(0, 10);
    await bedAdministration.bedNumberInput().fill(bedNumber);
    await bedAdministration.bedRowInput().fill('1');
    await bedAdministration.bedColumnInput().fill('1');
    await bedAdministration.bedLocationInput().click();
    await bedAdministration.bedLocationInput().fill(location.name);
    await page.getByRole('listbox').waitFor({ state: 'visible' });
    await page.getByRole('option', { name: location.name, exact: true }).first().click();
    await bedAdministration.occupancyStatusInput().selectOption({ value: 'AVAILABLE' });
    await bedAdministration.bedTypeInput().selectOption(uniqueTypeName1);
    await bedAdministration.bedTagsMultiSelect().click();
    await page.getByText(uniqueTagName1).nth(0).click();
    await page.keyboard.press('Tab');
    await bedAdministration.saveAndCloseButton().click();
  });
  await test.step('Then i swap a patient to another bed', async () => {
    const fullName = wardPatient.person?.display;
    await wardPage.goTo();
    await page.getByText(fullName).click();
    await patientBedSwap.transferButton().click();
    await patientBedSwap.swapButton().click();
    await page.getByText(`${bed.bedNumber} · Empty`).click();
    await patientBedSwap.saveButton().click();
  });
  await test.step('And i will confirm bed swap', async () => {
    await wardPage.goTo();
    await expect(page.getByText(bed.bedNumber)).toBeVisible();
  });
});
test.afterEach(async ({ api }) => {
  await dischargePatientFromBed(api, bed.id, wardPatient.uuid);
  await retireBedType(api, bedtype.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

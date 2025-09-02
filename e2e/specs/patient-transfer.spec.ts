import { type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType, type Patient, type Provider } from '../commands/types';
import { test } from '../core';
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
import { PatientTransferPage } from '../pages/patient-transfer';
import { BedAdministrationPage } from '../pages/bed-administration-page';
import { WardPage } from '../pages';

let patient: Patient;
let visit: Visit;
let bed: Bed;
let bedtype: BedType;
let provider: Provider;
let wardPatient: Patient;
let uniqueTagName1 = `Tag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
let uniqueTypeName1 = `Type_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  bedtype = await generateBedType(api);
  bed = await generateRandomBed(api, bedtype);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  await generateWardAdmission(api, provider.uuid, wardPatient.uuid);
});
test('Transfer Patient from Inpatient ward to Ward 1', async ({ page }) => {
  const patientTransfer = new PatientTransferPage(page);
  const bedAdministration = new BedAdministrationPage(page);
  const wardPage = new WardPage(page);
  await test.step('Admit a patient to Inpatient ward', async () => {
    await wardPage.goTo();
    await wardPage.clickManageAdmissionRequests();
    await page.getByRole('button', { name: 'Admit patient' }).first().click();
    await page.getByText(`${bed.bedNumber} · Empty`).click();
    await page.getByRole('button', { name: 'Admit' }).click();
  });

  await test.step('Then add a bed to the ward 1', async () => {
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
    await expect(page.getByText(displayName1).first()).toBeVisible();
  });

  await test.step('And i will create bed in Ward 1', async () => {
    await bedAdministration.openBedAdministration();
    await page.getByRole('button', { name: /Add bed/i }).click();
    const bedNumber = `B_${Date.now().toString().slice(-6)}`.slice(0, 10);
    await bedAdministration.bedNumberInput().fill(bedNumber);
    await bedAdministration.bedRowInput().fill('1');
    await bedAdministration.bedColumnInput().fill('1');
    await bedAdministration.bedLocationInput().click();
    await bedAdministration.bedLocationInput().fill('Ward 1');
    await page.getByRole('listbox').waitFor({ state: 'visible' });
    await page.getByRole('option', { name: 'Ward 1', exact: true }).first().click();
    await bedAdministration.occupancyStatusInput().selectOption({ value: 'AVAILABLE' });
    await bedAdministration.bedTypeInput().selectOption(uniqueTypeName1);
    await bedAdministration.bedTagsMultiSelect().click();
    await page.getByText(uniqueTagName1, { exact: true }).first().click();
    await page.keyboard.press('Tab');
    await bedAdministration.saveAndCloseButton().click();
  });
  await test.step('Then i transfer a patient to ward 1', async () => {
    const fullName = wardPatient.person?.display;
    await wardPage.goTo();
    await page.getByText(fullName).click();
    await patientTransfer.transferButton().click();
    await patientTransfer.searchInput().fill('Ward 1');
    await page.getByRole('listbox').waitFor({ state: 'visible' });
    await page.getByRole('option', { name: 'Ward 1', exact: true }).first().click();
    await patientTransfer.textArea().fill('E2E-Note');
    await patientTransfer.saveButton().click();
  });
  await test.step('And i confirm patient transfer', async () => {
    await bedAdministration.openBedManagement();
    await page.getByText('Ward 1').click();
  });
});
test.afterEach(async ({ api }) => {
  await dischargePatientFromBed(api, bed.id, wardPatient.uuid);
  await retireBedType(api, bedtype.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

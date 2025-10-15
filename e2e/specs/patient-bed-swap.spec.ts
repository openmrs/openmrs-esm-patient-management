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
import { WardPage } from '../pages';
import { expect } from '@playwright/test';

let location: Location;
let visit: Visit;
let bed: Bed;
let bedToSwap: Bed;
let bedToSwapType: BedType;
let bedtype: BedType;
let provider: Provider;
let wardPatient: Patient;

test.beforeEach(async ({ api }) => {
  location = await bedLocation(api);
  await changeToWardLocation(api);
  bedToSwapType = await generateBedType(api);
  bedToSwap = await generateRandomBed(api, bedToSwapType);
  bedtype = await generateBedType(api);
  bed = await generateRandomBed(api, bedtype);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  await generateWardAdmission(api, provider.uuid, wardPatient.uuid);
});
test('Swap the patient to another bed', async ({ page }) => {
  const wardPage = new WardPage(page);
  await test.step('Admit a patient to  ward', async () => {
    await wardPage.goTo();
    await wardPage.admitPatient(bed.bedNumber);
  });

  await test.step('Then i swap a patient to another bed', async () => {
    const fullName = wardPatient.person?.display;
    await wardPage.goTo();
    const patientUuid = wardPatient.uuid;
    await page.getByTestId(`ward-patient-card-${patientUuid}`).click();
    await wardPage.transferButton().click();
    await wardPage.swapButton().click();
    await page.getByText(`${bedToSwap.bedNumber} · Empty`).click();
    await wardPage.saveButton().click();
  });
  await test.step('And i will confirm bed swap', async () => {
    await wardPage.goTo();
    await expect(page.getByText(bedToSwap.bedNumber)).toBeVisible();
  });
});
test.afterEach(async ({ api }) => {
  await dischargePatientFromBed(api, bed.id, wardPatient.uuid);
  await retireBedType(api, bedtype.uuid, 'Retired during automated testing');
  await retireBedType(api, bedToSwapType.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});

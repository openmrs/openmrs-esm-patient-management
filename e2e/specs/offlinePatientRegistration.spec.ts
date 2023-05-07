import { test } from '../core';
import { expect } from '@playwright/test';
import { PatientRegistrationFormValues, RegistrationAndEditPage, OfflineActionsPage } from '../pages';
import { deletePatient, getPatient, waitUntilOfflineCacheStabilizes } from '../commands';
import dayjs from 'dayjs';
let patientUuid: string;
test('should register a patient offline', async ({ page, api }) => {
  test.setTimeout(5 * 60 * 1000);
  const patientRegistrationPage = new RegistrationAndEditPage(page);
  const offlineActionsPage = new OfflineActionsPage(page);
  const formValues: PatientRegistrationFormValues = {
    givenName: `Johnny`,
    middleName: 'Donny',
    familyName: `Ronny`,
    sex: 'male',
    birthdate: '01/02/2020',
    postalCode: '',
    address1: 'Bom Jesus Street',
    address2: '',
    country: 'Brazil',
    countyDistrict: 'Antônio dos Santos',
    stateProvince: 'Pernambuco',
    cityVillage: 'Recife',
    phone: '5555551234',
  };
  await waitUntilOfflineCacheStabilizes(page);
  await page.context().setOffline(true);
  await patientRegistrationPage.goto();
  await patientRegistrationPage.fillPatientRegistrationForm(formValues);
  await page.context().setOffline(false);
  await offlineActionsPage.goto();
  await offlineActionsPage.sync();
  await expect(page).toHaveURL(new RegExp('^[\\w\\d:\\/.-]+\\/patient\\/[\\w\\d-]+\\/chart\\/.*$'));
  const patientUuid = /patient\/(.+)\/chart/.exec(page.url())?.[1] ?? null;
  const patient = await getPatient(api, patientUuid);
  const { person } = patient;
  const { givenName, middleName, familyName, sex } = formValues;

  await expect(person.display).toBe(`${givenName} ${middleName} ${familyName}`);
  await expect(person.gender).toBe(sex[0].toUpperCase());
  await expect(dayjs(person.birthdate).format('DD/MM/YYYY')).toBe(formValues.birthdate);
  await expect(person.preferredAddress.address1).toBe(formValues.address1);
  await expect(person.preferredAddress.cityVillage).toBe(formValues.cityVillage);
  await expect(person.preferredAddress.stateProvince).toBe(formValues.stateProvince);
  await expect(person.preferredAddress.country).toBe(formValues.country);
  await expect(person.preferredAddress.countyDistrict).toBe(formValues.countyDistrict);
  await expect(person.attributes[0].display).toBe(`Telephone Number = ${formValues.phone}`);
});
test.afterEach(async ({ api }) => {
  if (patientUuid) {
    await deletePatient(api, patientUuid);
  }
});

import dayjs from 'dayjs';
import { expect } from '@playwright/test';
import { test } from '../core';
import { deletePatient, generateRandomPatient, getPatient, type Patient } from '../commands';
import { type PatientRegistrationFormValues, RegistrationAndEditPage } from '../pages';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

// TODO: Add email field after fixing O3-1883 (https://issues.openmrs.org/browse/O3-1883)
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
  stateProvince: 'Pernambuco',
  cityVillage: 'Recife',
  phone: '5555551234',
};

test('Edit a patient', async ({ page, api }) => {
  test.setTimeout(5 * 60 * 1000);
  const patientEditPage = new RegistrationAndEditPage(page);

  await test.step("When I visit the registration page to a patient's details", async () => {
    await patientEditPage.goto(patient.uuid);
    await patientEditPage.waitUntilTheFormIsLoaded();
  });

  test.describe.fixme('Broken due to the date picker and should be fixed', async () => {
    await test.step('And then I click on fill new values into the registration form and then click the `Submit` button', async () => {
      await expect(patientEditPage.givenNameInput()).not.toHaveValue('', { timeout: 2 * 60 * 1000 });

      await patientEditPage.fillPatientRegistrationForm(formValues);
    });
  });

  await test.step("Then I should be redirected to the patient's chart page and the patient object should have updated information", async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`);
    const updatedPatient = await getPatient(api, patient.uuid);
    const { person } = updatedPatient;
    const { givenName, middleName, familyName, sex } = formValues;

    await expect(person.display).toBe(`${givenName} ${middleName} ${familyName}`);
    await expect(person.gender).toMatch(new RegExp(sex[0], 'i'));
    await expect(dayjs(person.birthdate).format('DD/MM/YYYY')).toBe(formValues.birthdate);
    await expect(person.preferredAddress.address1).toBe(formValues.address1);
    await expect(person.preferredAddress.cityVillage).toBe(formValues.cityVillage);
    await expect(person.preferredAddress.stateProvince).toBe(formValues.stateProvince);
    await expect(person.preferredAddress.country).toBe(formValues.country);
    await expect(person.attributes[0].display).toBe(formValues.phone);
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});

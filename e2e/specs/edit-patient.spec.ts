import dayjs from 'dayjs';
import { expect } from '@playwright/test';
import { test } from '../core';
import { deletePatient, generateRandomPatient, getPatient } from '../commands';
import { RegistrationAndEditPage } from '../pages';
import { type Patient, type PatientRegistrationFormValues } from '../types';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

const formValues: PatientRegistrationFormValues = {
  givenName: `Johnny`,
  middleName: 'Donny',
  familyName: `Ronny`,
  sex: 'male',
  birthdate: { day: '01', month: '02', year: '2020' },
  postalCode: '',
  address1: 'Bom Jesus Street',
  address2: '',
  country: 'Brazil',
  stateProvince: 'Pernambuco',
  cityVillage: 'Recife',
  phone: '5555551234',
  email: 'johnnyronny@example.com',
};

test('Edit a patient', async ({ page, api }) => {
  test.setTimeout(5 * 60 * 1000);
  const patientEditPage = new RegistrationAndEditPage(page);

  await test.step("When I visit the registration page to a patient's details", async () => {
    await patientEditPage.goto(patient.uuid);
    await patientEditPage.waitUntilTheFormIsLoaded();
  });

  await test.step('And then I fill in the first name', async () => {
    await expect(patientEditPage.givenNameInput()).not.toHaveValue('', { timeout: 2 * 60 * 1000 });
    await patientEditPage.givenNameInput().fill(formValues.givenName);
  });

  await test.step('Then I fill in the middle name', async () => {
    await patientEditPage.middleNameInput().fill(formValues.middleName);
  });

  await test.step('Then I fill in the last name', async () => {
    await patientEditPage.familyNameInput().fill(formValues.familyName);
  });

  await test.step('Then I check the sex radio button', async () => {
    await patientEditPage.sexRadioButton(formValues.sex).check();
  });

  await test.step('Then I fill in the date of birth', async () => {
    await patientEditPage.birthdateDayInput().fill(formValues.birthdate.day);
    await patientEditPage.birthdateMonthInput().fill(formValues.birthdate.month);
    await patientEditPage.birthdateYearInput().fill(formValues.birthdate.year);
  });

  await test.step('And then I fill in the address', async () => {
    await patientEditPage.address1Input().fill(formValues.address1);
  });

  await test.step('Then I fill in the city/village', async () => {
    await patientEditPage.cityVillageInput().fill(formValues.cityVillage);
  });

  await test.step('Then I fill in the state/province', async () => {
    await patientEditPage.stateProvinceInput().fill(formValues.stateProvince);
  });

  await test.step('Then I fill in the country', async () => {
    await patientEditPage.countryInput().fill(formValues.country);
  });

  await test.step('Then I fill in the telephone number', async () => {
    await patientEditPage.phoneInput().fill(formValues.phone);
  });

  await test.step('And then I click the `Update patient` button', async () => {
    await patientEditPage.createPatientButton().click();
  });

  await test.step("Then I should be redirected to the patient's chart page and the patient object should have updated information", async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`);
    const updatedPatient = await getPatient(api, patient.uuid);
    const { person } = updatedPatient;
    const { givenName, middleName, familyName, sex } = formValues;

    expect(person.display).toBe(`${givenName} ${middleName} ${familyName}`);
    expect(person.gender).toMatch(new RegExp(sex[0], 'i'));
    expect(dayjs(person.birthdate).format('DD/MM/YYYY')).toBe(
      `${formValues.birthdate.day}/${formValues.birthdate.month}/${formValues.birthdate.year}`,
    );
    expect(person.preferredAddress.address1).toBe(formValues.address1);
    expect(person.preferredAddress.cityVillage).toBe(formValues.cityVillage);
    expect(person.preferredAddress.stateProvince).toBe(formValues.stateProvince);
    expect(person.preferredAddress.country).toBe(formValues.country);
    expect(person.attributes[0].display).toBe(formValues.phone);
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});

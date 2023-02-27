import { test } from '../core';
import { expect } from '@playwright/test';
import { PatientRegistrationFormValues, RegistrationAndEditPage } from '../pages';
import { deletePatient, generateRandomPatient, getPatient, Patient } from '../commands';
import dayjs from 'dayjs';

let patient: Patient;
test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('should be able to edit a patient', async ({ page, api }) => {
  test.setTimeout(5 * 60 * 1000);
  const patientEditPage = new RegistrationAndEditPage(page);

  await patientEditPage.goto(patient.uuid);

  await expect(patientEditPage.givenNameInput()).not.toHaveValue('', { timeout: 1000000 });

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
    countyDistrict: 'Antônio dos Santos',
    stateProvince: 'Pernambuco',
    cityVillage: 'Recife',
    phone: '5555551234',
  };

  await patientEditPage.fillPatientRegistrationForm(formValues);

  await expect(page).toHaveURL(`${process.env.E2E_UI_BASE_URL}patient/${patient.uuid}/chart/Patient Summary`);
  const updatedPatient = await getPatient(api, patient.uuid);
  const { person } = updatedPatient;
  const { givenName, middleName, familyName, sex } = formValues;

  await expect(person.display).toBe(`${givenName} ${middleName} ${familyName}`);
  await expect(person.gender).toBe(sex[0].toUpperCase());
  await expect(dayjs(person.birthdate).format('DD/MM/YYYY')).toBe(formValues.birthdate);
  // TODO: Check other attributes
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});

import dayjs from 'dayjs';
import { expect } from '@playwright/test';
import { test } from '../core';
import { type PatientRegistrationFormValues, RegistrationAndEditPage } from '../pages';
import { deletePatient, getPatient } from '../commands';

let patientUuid: string;

test('Register a new patient', async ({ page, api }) => {
  test.setTimeout(5 * 60 * 1000);
  const patientRegistrationPage = new RegistrationAndEditPage(page);

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

  await test.step('When I visit the registration page', async () => {
    await patientRegistrationPage.goto();
    await patientRegistrationPage.waitUntilTheFormIsLoaded();
  });

  await test.step('And then I click on fill new values into the registration form and then click the `Submit` button', async () => {
    await patientRegistrationPage.fillPatientRegistrationForm(formValues);
  });

  await test.step("Then I should be redirected to the new patient's chart page and a new patient record should be created from the information captured in the form", async () => {
    await expect(page).toHaveURL(new RegExp('^[\\w\\d:\\/.-]+\\/patient\\/[\\w\\d-]+\\/chart\\/.*$'));
    const patientUuid = /patient\/(.+)\/chart/.exec(page.url())?.[1] ?? null;
    await expect(patientUuid).not.toBeNull();

    const patient = await getPatient(api, patientUuid);
    const { person } = patient;
    const { givenName, middleName, familyName, sex } = formValues;

    await expect(person.display).toBe(`${givenName} ${middleName} ${familyName}`);
    await expect(person.gender).toMatch(new RegExp(sex[0], 'i'));
    await expect(dayjs(person.birthdate).format('DD/MM/YYYY')).toBe(formValues.birthdate);
    await expect(person.preferredAddress.address1).toBe(formValues.address1);
    await expect(person.preferredAddress.cityVillage).toBe(formValues.cityVillage);
    await expect(person.preferredAddress.stateProvince).toBe(formValues.stateProvince);
    await expect(person.preferredAddress.country).toBe(formValues.country);
    await expect(person.attributes[0].display).toBe(`Telephone Number = ${formValues.phone}`);
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patientUuid);
});

import { test } from '../core';
import { PatientRegistrationFormValues, PatientRegistrationPage } from '../pages/patientRegistrationPage';

test('should be able to register a patient', async ({ page, api }) => {
  const patientRegistrationPage = new PatientRegistrationPage(page);

  await patientRegistrationPage.goto();

  const formValues: PatientRegistrationFormValues = {
    givenName: 'Johnny',
    middleName: 'Donny',
    familyName: 'Ronny',
    sex: 'male',
    birthdate: '1/2/2020',
    postalCode: '',
    address1: 'Bom Jesus Street',
    address2: '',
    country: 'Brazil',
    countyDistrict: 'Antônio dos Santos',
    stateProvince: 'Pernambuco',
    cityVillage: 'Recife',
    phone: '5555551234',
    email: 'jodon@example.user.com',
  };

  await patientRegistrationPage.fillPatientRegistrationForm(formValues);

  const newPatientUuid = /patient\/(.+)\/chart/.exec(page.url())?.[1] ?? '';
  const newPatientRes = await api.get(`rest/v1/patient/${newPatientUuid}`);

  await expect(page).toHaveURL(`${process.env.E2E_UI_BASE_URL}patient/${newPatientUuid}/chart/Patient Summary`);
  await expect(newPatientRes.ok()).toBeTruthy();
  const newAddress1 = newPatientRes.json().then((data) => {
    return data.person.address1;
  });
  await expect(newAddress1).toBe(formValues.address1);
});

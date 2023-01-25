import { test } from '../core';
import { PatientRegistrationFormValues, PatientRegistrationPage } from '../pages/patientRegistrationPage';

test('should be able to register a patient', async ({ loginAsAdmin: page, api }) => {
  const patientRegistrationPage = new PatientRegistrationPage(page);

  await patientRegistrationPage.goto();

  const formValues: PatientRegistrationFormValues = {
    givenName: 'Johnny',
    middleName: 'Donny',
    familyName: 'Ronny',
    sex: 'male',
    birthdate: '2020-2-1',
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
});

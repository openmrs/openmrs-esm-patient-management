import { expect } from '@playwright/test';
import { test } from '../core';
import { type PatientRegistrationFormValues, RegistrationAndEditPage } from '../pages';
import { deletePatient, getPatient } from '../commands';

let patientUuid: string;

test('Register a new patient', async ({ page }) => {
  test.setTimeout(5 * 60 * 1000);
  const patientRegistrationPage = new RegistrationAndEditPage(page);

  // TODO: Add email field after fixing O3-1883 (https://issues.openmrs.org/browse/O3-1883)
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
  };

  await test.step('When I visit the registration page', async () => {
    await patientRegistrationPage.goto();
    await patientRegistrationPage.waitUntilTheFormIsLoaded();
  });

  await test.step('And then I fill the registration form and then click the `Submit` button', async () => {
    await patientRegistrationPage.fillPatientRegistrationForm(formValues);
    await expect(page.getByText(/new patient created/i)).toBeVisible();
  });

  await test.step("Then I should be redirected to the new patient's chart page", async () => {
    const patientChartUrlRegex = new RegExp('^[\\w\\d:\\/.-]+\\/patient\\/[\\w\\d-]+\\/chart\\/.*$');
    await page.waitForURL(patientChartUrlRegex);
    await expect(page).toHaveURL(patientChartUrlRegex);
  });

  await test.step("And I should the newly registered patient's details displayed in the patient banner", async () => {
    const patientBanner = page.locator('header[aria-label="patient banner"]');
    await patientBanner.waitFor({ state: 'visible' });

    await expect(page.getByLabel('patient banner').getByText(/johnny donny ronny/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/male/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/4 yrs, 6 mths/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/01 — Feb — 2020/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/OpenMRS ID/i)).toBeVisible();
    await page
      .getByLabel('patient banner')
      .getByRole('button', { name: /show details/i })
      .click();
    await expect(page.getByLabel('patient banner').getByRole('button', { name: /hide details/i })).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/^address$/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/address line 1: bom jesus street/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/city: recife/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/state: pernambuco/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/country: brazil/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/contact details/i)).toBeVisible();
    await expect(page.getByLabel('patient banner').getByText(/telephone number: 5555551234/i)).toBeVisible();
  });
});

test('Register an unknown patient', async ({ api, page }) => {
  const patientRegistrationPage = new RegistrationAndEditPage(page);

  await test.step('When I visit the patient registration page', async () => {
    await patientRegistrationPage.goto();
    await patientRegistrationPage.waitUntilTheFormIsLoaded();
  });

  await test.step(`And I click on the unknown 'patient's name' tab`, async () => {
    await page.getByRole('tab', { name: /no/i }).first().click();
  });

  await test.step('And I select `female` as the patient gender', async () => {
    await page
      .locator('label')
      .filter({ hasText: /female/i })
      .locator('span')
      .first()
      .click();
  });

  await test.step('And I click on the unknown `Date of Birth` tab', async () => {
    await page.getByRole('tab', { name: /no/i }).nth(1).click();
  });

  await test.step('And I fill the field for estimated age in years', async () => {
    const estimatedAgeField = await page.getByLabel(/estimated age in years/i);
    await estimatedAgeField.clear();
    await estimatedAgeField.fill('25');
  });

  await test.step('And I click on the submit button', async () => {
    await page.getByRole('button', { name: /register patient/i }).click();
  });

  await test.step('Then I should see a success toast notification', async () => {
    await expect(page.getByText(/new patient created/i)).toBeVisible();
  });

  await test.step('And I should see the newly recorded unknown patient dispalyed on the dashboard', async () => {
    const patient = await getPatient(api, /patient\/(.+)\/chart/.exec(page.url())?.[1]);
    expect(patient?.person?.display).toBe('UNKNOWN UNKNOWN');
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patientUuid);
});

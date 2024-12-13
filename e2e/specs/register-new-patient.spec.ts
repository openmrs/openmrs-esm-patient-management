import { expect } from '@playwright/test';
import { test } from '../core';
import { RegistrationAndEditPage } from '../pages';
import { type PatientRegistrationFormValues } from '../types';
import { deletePatient } from '../commands';

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

  await test.step('And then I fill the registration form with the data in `formValues` and then click the `Submit` button', async () => {
    await patientRegistrationPage.fillPatientRegistrationForm(formValues);
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/new patient created/i)).toBeVisible();
  });

  await test.step("And I should be redirected to the new patient's chart page", async () => {
    const patientChartUrlRegex = new RegExp('^[\\w\\d:\\/.-]+\\/patient\\/[\\w\\d-]+\\/chart\\/.*$');
    await page.waitForURL(patientChartUrlRegex);
    await expect(page).toHaveURL(patientChartUrlRegex);
  });

  await test.step("And I should see the newly registered patient's details displayed in the patient banner", async () => {
    const patientBanner = page.locator('header[aria-label="patient banner"]');

    await expect(patientBanner).toBeVisible();
    await expect(patientBanner.getByText('Johnny Donny Ronny')).toBeVisible();
    await expect(patientBanner.getByText(/male/i)).toBeVisible();
    await expect(patientBanner.getByText(/01-Feb-2020/i)).toBeVisible();
    await expect(patientBanner.getByText(/OpenMRS ID/i)).toBeVisible();
  });

  await test.step('And when I click the `Show more` button in the patient banner', async () => {
    await page
      .getByLabel('patient banner')
      .getByRole('button', { name: /show more/i })
      .click();
  });

  await test.step("Then I should see the patient's address and contact details displayed in the patient banner", async () => {
    const patientBanner = page.locator('header[aria-label="patient banner"]');

    await expect(patientBanner.getByRole('button', { name: /show less/i })).toBeVisible();
    await expect(patientBanner.getByText(/^address$/i)).toBeVisible();
    await expect(patientBanner.getByText(/address line 1: Bom Jesus Street/i)).toBeVisible();
    await expect(patientBanner.getByText(/city: Recife/i)).toBeVisible();
    await expect(patientBanner.getByText(/state: Pernambuco/i)).toBeVisible();
    await expect(patientBanner.getByText(/country: Brazil/i)).toBeVisible();
    await expect(patientBanner.getByText(/contact details/i)).toBeVisible();
    await expect(patientBanner.getByText(/telephone number: 5555551234/i)).toBeVisible();
  });
});

test('Register an unknown patient', async ({ api, page }) => {
  const patientRegistrationPage = new RegistrationAndEditPage(page);

  await test.step('When I visit the patient registration page', async () => {
    await patientRegistrationPage.goto();
    await patientRegistrationPage.waitUntilTheFormIsLoaded();
  });

  await test.step("And I click the `No` tab in the `Patient's Name is Known?` field", async () => {
    await page.getByRole('tab', { name: /no/i }).first().click();
  });

  await test.step('And then I set the gender to `Female`', async () => {
    await page
      .locator('label')
      .filter({ hasText: /female/i })
      .locator('span')
      .first()
      .click();
  });

  await test.step('And then I click on the `No` tab in the "Date of Birth Known" field', async () => {
    await page.getByRole('tab', { name: /no/i }).nth(1).click();
  });

  await test.step('And then I fill in 25 as the estimated age in years', async () => {
    const estimatedAgeField = page.getByLabel(/estimated age in years/i);
    await estimatedAgeField.clear();
    await estimatedAgeField.fill('25');
  });

  await test.step('And I click on the submit button', async () => {
    await page.getByRole('button', { name: /register patient/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/new patient created/i)).toBeVisible();
  });

  await test.step("And I should be redirected to the new patient's chart page", async () => {
    const patientChartUrlRegex = new RegExp('^[\\w\\d:\\/.-]+\\/patient\\/[\\w\\d-]+\\/chart\\/.*$');
    await page.waitForURL(patientChartUrlRegex);
    await expect(page).toHaveURL(patientChartUrlRegex);
  });

  await test.step("And I should see the newly registered patient's details displayed in the patient banner", async () => {
    const patientBanner = page.locator('header[aria-label="patient banner"]');

    await expect(patientBanner).toBeVisible();
    await expect(patientBanner.getByText('Unknown Unknown')).toBeVisible();
    await expect(patientBanner.getByText(/female/i)).toBeVisible();
    await expect(patientBanner.getByText(/25 yrs/i)).toBeVisible();
    await expect(patientBanner.getByText(/01-Jan-1999/i)).toBeVisible();
    await expect(patientBanner.getByText(/OpenMRS ID/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patientUuid);
});

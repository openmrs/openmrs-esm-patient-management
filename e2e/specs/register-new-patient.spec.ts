import { expect } from '@playwright/test';
import { deletePatient } from '../commands';
import { RegistrationAndEditPage } from '../pages';
import { test } from '../core';
import { type PatientRegistrationFormValues } from '../types';

const PATIENT_CHART_URL = /\/patient\/(?<uuid>[a-f0-9-]{36})\/chart/i;
let patientUuid: string;

test('Register a new patient', async ({ page }) => {
  test.slow();
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
    // Check for explicit visibility of address template fields
    await expect(patientRegistrationPage.addressHierarchySearchInput()).toBeVisible();
    await expect(patientRegistrationPage.address1Input()).toBeVisible();
    await expect(patientRegistrationPage.countryInput()).toBeVisible();
    await expect(patientRegistrationPage.stateProvinceInput()).toBeVisible();
    await expect(patientRegistrationPage.cityVillageInput()).toBeVisible();

    // Fill and submit the form
    await patientRegistrationPage.fillPatientRegistrationForm(formValues);
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/new patient created/i)).toBeVisible();
  });

  await test.step("And I should be redirected to the new patient's chart page", async () => {
    await page.waitForURL(PATIENT_CHART_URL);
    await expect(page).toHaveURL(PATIENT_CHART_URL);

    const url = page.url();
    const match = url.match(PATIENT_CHART_URL);
    patientUuid = match?.[1];
    expect(patientUuid).toBeTruthy();
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

test('Register an unknown patient', async ({ page }) => {
  const patientRegistrationPage = new RegistrationAndEditPage(page);

  await test.step('When I visit the registration page', async () => {
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

  const estimatedAge = 25;
  await test.step(`And then I fill in ${estimatedAge} as the estimated age in years`, async () => {
    await page.getByLabel(/estimated age in years/i).fill(`${estimatedAge}`);
  });

  await test.step('And I click on the submit button', async () => {
    await page.getByRole('button', { name: /register patient/i }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/new patient created/i)).toBeVisible();
  });

  await test.step("And I should be redirected to the new patient's chart page", async () => {
    await page.waitForURL(PATIENT_CHART_URL);
    await expect(page).toHaveURL(PATIENT_CHART_URL);

    const url = page.url();
    const match = url.match(PATIENT_CHART_URL);
    patientUuid = match?.[1];
    expect(patientUuid).toBeTruthy();
  });

  await test.step("And I should see the newly registered patient's details displayed in the patient banner", async () => {
    const patientBanner = page.locator('header[aria-label="patient banner"]');
    const expectedBirthYear = new Date().getFullYear() - estimatedAge;

    await expect(patientBanner).toBeVisible();
    await expect(patientBanner.getByText('Unknown Unknown')).toBeVisible();
    await expect(patientBanner.getByText(/female/i)).toBeVisible();
    await expect(patientBanner.getByText(/25 yrs/i)).toBeVisible();
    await expect(patientBanner.getByText(new RegExp(`01-Jan-${expectedBirthYear}`, 'i'))).toBeVisible();
    await expect(patientBanner.getByText(/OpenMRS ID/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  if (patientUuid) {
    try {
      await deletePatient(api, patientUuid);
    } catch (error) {
      console.error(`Error deleting patient ${patientUuid}: ${error}`);
    }
  }
});

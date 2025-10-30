import { expect } from '@playwright/test';
import { test } from '../core';
import { HomePage } from '../pages';

test('Search patient by patient identifier', async ({ page, patient }) => {
  // extract details from the created patient
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter a valid patient identifier into the search field', async () => {
    await homePage.searchPatient(openmrsIdentifier);
  });

  await test.step('Then I should see only the patient with the entered identifier', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(/1 search result/);
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(openmrsIdentifier));
  });

  await test.step('When I click on the patient record', async () => {
    await homePage.clickOnPatientResult(firstName);
  });

  await test.step("Then I should be redirected to the patient's chart page", async () => {
    await expect(homePage.page).toHaveURL(
      `${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`,
    );
  });
});

test('Search patient by partial patient identifier', async ({ page, patient }) => {
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];
  
  // Get first 3-5 characters of identifier for partial search
  const partialIdentifier = openmrsIdentifier.substring(0, Math.min(5, openmrsIdentifier.length));
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter a partial patient identifier into the search field', async () => {
    await homePage.searchPatient(partialIdentifier);
  });

  await test.step('Then I should see the patient with the matching identifier', async () => {
    // May show multiple results if other patients have similar identifiers
    await expect(homePage.floatingSearchResultsContainer()).toContainText(/search result/);
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(openmrsIdentifier));
  });

  await test.step('When I click on the patient record', async () => {
    await homePage.clickOnPatientResult(firstName);
  });

  await test.step("Then I should be redirected to the patient's chart page", async () => {
    await expect(homePage.page).toHaveURL(
      `${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`,
    );
  });
});

test('Search patient by full name', async ({ page, patient }) => {
  // extract details from the created patient
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter a valid patient name into the search field', async () => {
    await homePage.searchPatient(`${firstName} ${lastName}`);
  });

  await test.step('Then I should see only the patient with the entered name', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(/1 search result/);
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(openmrsIdentifier));
  });

  await test.step('When I click on the patient', async () => {
    await homePage.clickOnPatientResult(openmrsIdentifier);
  });

  await test.step("Then I should be in the patient's chart page", async () => {
    await expect(homePage.page).toHaveURL(
      `${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`,
    );
  });

  await test.step('When I click on the app logo', async () => {
    await page.getByRole('link', { name: /openmrs logo/i }).click();
  });

  await test.step('Then I should be redirected to the home page', async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/home/service-queues`);
  });
});

test('Search patient by first name only', async ({ page, patient }) => {
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter only the first name into the search field', async () => {
    await homePage.searchPatient(firstName);
  });

  await test.step('Then I should see the patient in the search results', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toContainText(/search result/);
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));
  });
});

test('Search patient by last name only', async ({ page, patient }) => {
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter only the last name into the search field', async () => {
    await homePage.searchPatient(lastName);
  });

  await test.step('Then I should see the patient in the search results', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toContainText(/search result/);
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));
  });
});

test('Search with non-existent patient identifier shows no results', async ({ page }) => {
  const nonExistentIdentifier = 'NONEXISTENT123456';
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter a non-existent patient identifier', async () => {
    await homePage.searchPatient(nonExistentIdentifier);
  });

  await test.step('Then I should see a no results message', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toContainText(/no patient/i);
  });
});

test('Search with non-existent patient name shows no results', async ({ page }) => {
  const nonExistentName = 'NonExistentPatient XYZ';
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter a non-existent patient name', async () => {
    await homePage.searchPatient(nonExistentName);
  });

  await test.step('Then I should see a no results message', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toContainText(/no patient/i);
  });
});

test('Search with single character shows appropriate results or message', async ({ page }) => {
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter a single character into the search field', async () => {
    await homePage.searchPatient('a');
  });

  await test.step('Then I should see either search results or a message', async () => {
    const container = homePage.floatingSearchResultsContainer();
    await expect(container).toBeVisible();
  });
});

test('Search handles special characters in identifier', async ({ page, patient }) => {
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter an identifier that may contain special characters', async () => {
    await homePage.searchPatient(openmrsIdentifier);
  });

  await test.step('Then I should see the correct patient in results', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toContainText(/search result/);
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));
  });
});

test('Search results show correct patient information', async ({ page, patient }) => {
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];
  const gender = patient.person.gender;
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I search for a patient', async () => {
    await homePage.searchPatient(openmrsIdentifier);
  });

  await test.step('Then I should see all patient details in the results', async () => {
    const container = homePage.floatingSearchResultsContainer();
    await expect(container).toHaveText(new RegExp(firstName));
    await expect(container).toHaveText(new RegExp(lastName));
    await expect(container).toHaveText(new RegExp(openmrsIdentifier));
    await expect(container).toContainText(gender);
  });
});
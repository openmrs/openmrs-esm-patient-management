import { expect } from '@playwright/test';
import { test } from '../core';
import { HomePage } from '../pages';
import { getPatientIdentifierStr } from '../commands';

// Tests for patient-search-icon extension
test.describe('Patient Search Icon Extension', () => {
  test('Search patient by patient identifier using patient-search-icon', async ({ page, patient }) => {
    const openmrsIdentifier = getPatientIdentifierStr(patient);
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

  test('Search patient by full name using patient-search-icon', async ({ page, patient }) => {
    const openmrsIdentifier = getPatientIdentifierStr(patient);
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
      const logoLink = page.getByRole('link', { name: /openmrs logo/i });
      await logoLink.click();
    });

    await test.step('Then I should be redirected to the home page', async () => {
      await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/home/service-queues`);
    });
  });
});

// Tests for search page
test.describe('Search Page', () => {
  test('Search patient by identifier using search page', async ({ page, patient }) => {
    const openmrsIdentifier = getPatientIdentifierStr(patient);
    const firstName = patient.person.display.split(' ')[0];
    const lastName = patient.person.display.split(' ')[1];

    await test.step('When I navigate to the search page with the identifier in the query', async () => {
      // Wait for the API call to complete
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/ws/rest/v1/patient') && response.status() === 200,
        { timeout: 10000 }
      );
      
      await page.goto(`${process.env.E2E_BASE_URL}/spa/search?query=${encodeURIComponent(openmrsIdentifier)}`);
      
      // Wait for the search API response
      await responsePromise;
    });

    await test.step('Then I should see the patient with the entered identifier', async () => {
      const resultsContainer = page.locator('[data-openmrs-role="Search Results"]');
      await expect(resultsContainer).toBeVisible({ timeout: 10000 });
      await expect(resultsContainer).toContainText(new RegExp(firstName));
      await expect(resultsContainer).toContainText(new RegExp(lastName));
      await expect(resultsContainer).toContainText(new RegExp(openmrsIdentifier));
    });

    await test.step('When I click on the patient record', async () => {
      await page.getByText(firstName).first().click();
    });

    await test.step("Then I should be redirected to the patient's chart page", async () => {
      await expect(page).toHaveURL(
        `${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`,
      );
    });
  });

  test('Search patient by name using search page', async ({ page, patient }) => {
    const openmrsIdentifier = getPatientIdentifierStr(patient);
    const firstName = patient.person.display.split(' ')[0];
    const lastName = patient.person.display.split(' ')[1];

    await test.step('When I navigate to the search page with the name in the query', async () => {
      // Wait for the API call to complete
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/ws/rest/v1/patient') && response.status() === 200,
        { timeout: 10000 }
      );
      
      await page.goto(`${process.env.E2E_BASE_URL}/spa/search?query=${encodeURIComponent(`${firstName} ${lastName}`)}`);
      
      // Wait for the search API response
      await responsePromise;
    });

    await test.step('Then I should see the patient with the entered name', async () => {
      const resultsContainer = page.locator('[data-openmrs-role="Search Results"]');
      await expect(resultsContainer).toBeVisible({ timeout: 10000 });
      await expect(resultsContainer).toContainText(new RegExp(firstName));
      await expect(resultsContainer).toContainText(new RegExp(lastName));
      await expect(resultsContainer).toContainText(new RegExp(openmrsIdentifier));
    });

    await test.step('When I click on the patient record', async () => {
      await page.getByText(openmrsIdentifier).first().click();
    });

    await test.step("Then I should be redirected to the patient's chart page", async () => {
      await expect(page).toHaveURL(
        `${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`,
      );
    });
  });
});

// Tests for patient-search-button extension
test.describe('Patient Search Button Workspace', () => {
  test('Search patient using patient-search-button workspace', async ({ page, patient }) => {
    const openmrsIdentifier = getPatientIdentifierStr(patient);
    const firstName = patient.person.display.split(' ')[0];
    const lastName = patient.person.display.split(' ')[1];

    await test.step('When I visit the home page', async () => {
      await page.goto(`${process.env.E2E_BASE_URL}/spa/home`);
    });

    await test.step('And I click the patient search button', async () => {
      const searchButton = page.getByRole('button', { name: /search patient/i });
      await expect(searchButton).toBeVisible({ timeout: 5000 });
      await searchButton.click();
    });

    await test.step('Then I should see the patient search workspace', async () => {
      const workspaceSearchBar = page.getByTestId('patientSearchBar');
      await expect(workspaceSearchBar).toBeVisible({ timeout: 5000 });
    });

    await test.step('When I enter a patient identifier in the workspace search bar', async () => {
      const workspaceSearchBar = page.getByTestId('patientSearchBar');
      
      // Wait for the API response after typing
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/ws/rest/v1/patient') && response.status() === 200,
        { timeout: 10000 }
      );
      
      await workspaceSearchBar.fill(openmrsIdentifier);
      
      // Wait for the search to complete
      await responsePromise;
    });

    await test.step('Then I should see the patient in the workspace results', async () => {
      const resultsContainer = page.locator('[data-openmrs-role="Search Results"]');
      await expect(resultsContainer).toBeVisible({ timeout: 10000 });
      await expect(resultsContainer).toContainText(new RegExp(firstName));
      await expect(resultsContainer).toContainText(new RegExp(lastName));
    });
  });
});

// Tests for patient-search-bar extension
test.describe('Patient Search Bar Extension', () => {
  test('Search patient using patient-search-bar in slot', async ({ page, patient }) => {
    const openmrsIdentifier = getPatientIdentifierStr(patient);
    const firstName = patient.person.display.split(' ')[0];
    const lastName = patient.person.display.split(' ')[1];

    await test.step('When I visit a page that includes patient-search-bar extension', async () => {
      await page.goto(`${process.env.E2E_BASE_URL}/spa/home`);
    });

    await test.step('And I find the patient-search-bar', async () => {
      const searchBar = page.getByTestId('patientSearchBar');
      await expect(searchBar).toBeVisible({ timeout: 5000 });
    });

    await test.step('When I enter a patient identifier in the search bar', async () => {
      const searchBar = page.getByTestId('patientSearchBar');
      
      // Wait for the API response after typing
      const responsePromise = page.waitForResponse(
        (response) => response.url().includes('/ws/rest/v1/patient') && response.status() === 200,
        { timeout: 10000 }
      );
      
      await searchBar.fill(openmrsIdentifier);
      
      // Wait for the search to complete
      await responsePromise;
    });

    await test.step('Then I should see search results', async () => {
      const resultsContainer = page.locator('[data-testid="floatingSearchResultsContainer"]');
      await expect(resultsContainer).toBeVisible({ timeout: 5000 });
      await expect(resultsContainer).toContainText(new RegExp(firstName));
      await expect(resultsContainer).toContainText(new RegExp(lastName));
    });
  });
});
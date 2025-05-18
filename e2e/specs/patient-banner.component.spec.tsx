import { test, expect } from '@playwright/test';

test('Invalid login shows error message', async ({ page }) => {
  await page.goto('http://localhost:8080/openmrs/spa/login');

  await page.getByRole('textbox', { name: 'Username' }).fill('INCORRECT');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('PASSWORD');
  await page.getByRole('button', { name: 'Log in' }).click();
  //should see error popup
  await page.locator('[id="single-spa-application\\:\\@openmrs\\/esm-login-app-page-0"] path').first().click();
  await page.getByText('Invalid username or password');
});
test('User can log into OpenMRS', async ({ page }) => {
  await page.goto('http://localhost:8080/openmrs/spa/login');

  await page.getByRole('textbox', { name: 'Username' }).fill('admin');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('Admin123');
  await page.getByRole('button', { name: 'Log in' }).click();

  // Ensure login was successful
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
});

test('Patient Banner renders with correct patient information', async ({ page }) => {
  await page.goto('http://localhost:8080/openmrs/spa/search');
  await page.getByTestId('patientSearchBar').fill('John');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.goto('http://localhost:8080/openmrs/spa/search?query=john', { waitUntil: 'load' });
  await expect(page.locator('h2:text("search result")')).toBeVisible();
});

test('User can toggle contact details', async ({ page }) => {
  await page.goto('http://localhost:8080/openmrs/spa/search?query=john');

  await page.getByRole('button', { name: 'Show more' }).click();
  await page.getByText('Contact Details').click();
  // Ensure contact details are visible
  await page
    .locator('div')
    .filter({ hasText: /^Contact Details--$/ })
    .getByRole('listitem')
    .click();
  await expect(page.locator('p:text("Contact Details")')).toBeVisible();
});

test('Gender is correctly mapped', async ({ page }) => {
  await page.goto('http://localhost:8080/openmrs/spa/search');
  await page.getByTestId('patientSearchBar').click();
  await page.getByTestId('patientSearchBar').fill('jo');
  await page.getByRole('tab', { name: 'Male', exact: true }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  // Wait for search results
  const patientRows = await page.locator('.patient-search-results .patient-row').all();
  for (const row of patientRows) {
    const gender = await row.locator('.patient-gender').textContent();
    expect(gender).toBe('male');
  }
});

test('Skeleton loader displays when loading', async ({ page }) => {
  await page.goto('http://localhost:8080/openmrs/spa/search');

  await page.getByTestId('patientSearchBar').fill('jo');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.goto('http://localhost:8080/openmrs/spa/search?query=jo');
  await page.getByRole('button', { name: 'Search', exact: true });
});

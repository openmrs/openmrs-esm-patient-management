import { test, expect } from '@playwright/test';

try {
  require('@openmrs/esm-service-queues-app/src/types'); // Mock missing module
} catch (error) {
  console.warn("Warning: Missing module '@openmrs/esm-service-queues-app/src/types'. Using fallback.");
}

test.describe('Registration Page Tests', () => {
  test('Log in to OpenMRS', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/login');
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('Admin123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: 'Home' }).click();
  });

  test('Verify navigation to the Home page', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/home', { waitUntil: 'networkidle' });
    await page.getByRole('link', { name: 'Home' }).dblclick();
    await expect(page).toHaveURL(/\/openmrs\/spa\/home/);
  });

  test('Navigate to the Registration page', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/home');
    await page.getByRole('button', { name: 'Add patient' }).click();
    await page.goto('http://localhost:8080/openmrs/spa/patient-registration');
    await page.getByRole('button', { name: 'Register patient' }).dblclick();
    await expect(page).toHaveURL(/\/openmrs\/spa\/patient-registration/);
  });

  test('Mock auto-complete data', async ({ page }) => {
    await page.route('**/registration/autocomplete', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          suggestions: ['John Doe', 'Jane Smith', 'Jake Johnson'],
        }),
      }),
    );
  });
  test('Test auto-completion input', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/patient-registration');
    await page.getByRole('button', { name: 'Register patient' }).dblclick();
    const autoCompleteInput = await page.getByRole('textbox', { name: 'First Name' });
    await autoCompleteInput.click();
    await autoCompleteInput.fill('Ja');
    const suggestions = await expect(page.getByRole('listbox')).toBeVisible();

    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const suggestionItems = listbox.locator('li');
    expect(await suggestionItems.count()).toBe(2);
    expect(await suggestionItems.nth(0).innerText()).toContain('Jane Smith');
    expect(await suggestionItems.nth(1).innerText()).toContain('Jake Johnson');
  });

  test('Select an option from the suggestions', async ({ page }) => {
    const firstSuggestion = await page.getByText('Jane Smith');
    await firstSuggestion.click();

    const autoCompleteInput = await page.getByRole('textbox', { name: 'Search Patients' });
    expect(await autoCompleteInput.inputValue()).toBe('Jane Smith');
  });
});

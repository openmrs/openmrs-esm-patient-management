import { test, expect } from '@playwright/test';

test.describe('Combo Input Component Tests', () => {
  test('Log in to OpenMRS', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('Admin123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: 'Home' }).click();
  });

  test('Validate dropdown appears with autocomplete data', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/patient-registration');

    // Mock API response before interacting with ComboInput
    await page.route('**/registration/autocomplete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          suggestions: ['Jane Smith', 'Jake Johnson'],
        }),
      });
    });

    const comboInput = await page.getByRole('textbox', { name: 'First Name' });
    await comboInput.click();
    await comboInput.fill('Ja');

    // Wait for API response before checking dropdown
    await page.waitForResponse(
      (response) => response.url().includes('/registration/autocomplete') && response.status() === 200,
    );

    await expect(page.getByRole('listbox')).toBeVisible();
    const suggestionItems = page.getByRole('listbox').locator('li');
    await expect(suggestionItems.count()).toBe(2);
    await expect(suggestionItems.nth(0)).toHaveText('Jane Smith');
    await expect(suggestionItems.nth(1)).toHaveText('Jake Johnson');
  });

  test('Keyboard navigation selects the correct option', async ({ page }) => {
    await page.goto('http://localhost:8080/openmrs/spa/patient-registration');
    const comboInput = await page.getByRole('textbox', { name: 'First Name' });

    await comboInput.click();
    await comboInput.fill('Ja');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(comboInput).toHaveValue('Jane Smith');
  });
});

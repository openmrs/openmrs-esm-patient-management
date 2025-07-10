import { test, expect } from '@playwright/test';
import { WardAllocation } from '../pages/ward-allocation';

const ward1BedType = {
  name: 'ward1-bed',
  displayName: 'Ward 1 Bed',
  description: 'Standard bed in Ward 1',
};

const ward1BedLayout = {
  bedId: 301,
  bedNumber: '301A',
  bedUuid: 'uuid-ward1-bed',
  rowNumber: 1,
  columnNumber: 1,
  location: 'Ward 1',
  status: 'Available',
  bedType: ward1BedType,
};

test('Create bed type and allocate ward with detailed steps', async ({ page }) => {
  const wardAllocation = new WardAllocation(page);

  await test.step('Navigate to bed types management page', async () => {
    await wardAllocation.goto('bed-management/bed-types');
  });

  await test.step('Click Add bed type button', async () => {
    await page.getByRole('button', { name: 'Add bed type' }).click();
  });

  await test.step('Fill bed name input', async () => {
    await wardAllocation.bedNameInput().fill(ward1BedType.name);
  });

  await test.step('Fill display name input', async () => {
    await wardAllocation.displayNameInput().fill(ward1BedType.displayName);
  });

  await test.step('Fill description input', async () => {
    await wardAllocation.descriptionInput().fill(ward1BedType.description);
  });

  await test.step('Check save button enabled', async () => {
    await wardAllocation.expectSaveEnabled();
  });

  await test.step('Submit bed type form', async () => {
    await wardAllocation.submit();
  });

  await expect(page.getByText('ward1-bed').nth(1)).toBeVisible();
  await expect(page.getByText('inpatient-bed').nth(1)).toBeVisible();
});
test('allocate beds to wards', async ({ page }) => {
  const wardAllocation = new WardAllocation(page);
  await wardAllocation.goto('bed-management/bed-administration');

  await test.step('Click Add Bed button', async () => {
    await page.getByRole('button', { name: 'Add Bed' }).click();
  });

  await test.step('Fill bed ID input', async () => {
    await wardAllocation.bedIdInput().fill(ward1BedLayout.bedId.toString());
  });

  await test.step('Fill bed row input', async () => {
    await wardAllocation.bedRowInput().fill(ward1BedLayout.rowNumber.toString());
  });

  await test.step('Fill bed column input', async () => {
    await wardAllocation.bedColumnInput().fill(ward1BedLayout.columnNumber.toString());
  });

  await test.step('Select location from combo box', async () => {
    await wardAllocation.locationComboBox().click();
    await page.keyboard.type(ward1BedLayout.location);
    await page.getByRole('option', { name: new RegExp(ward1BedLayout.location, 'i') }).click();
    await page.keyboard.press('Tab');
  });

  await test.step('Select occupancy status', async () => {
    await wardAllocation.occupancyStatusSelect().click();
    await wardAllocation.occupancyStatusSelect().selectOption({ label: ward1BedLayout.status });
    await page.keyboard.press('Tab');
  });

  await test.step('Select bed type', async () => {
    await wardAllocation.bedTypeSelect().click();
    await wardAllocation.bedTypeSelect().selectOption({ label: ward1BedLayout.bedType.name });
  });

  await test.step('Check save button enabled before submitting bed allocation', async () => {
    await wardAllocation.expectSaveEnabled();
  });

  await test.step('Submit bed allocation form', async () => {
    await wardAllocation.submit();
  });

  await test.step('Verify success notification for bed creation', async () => {
    await expect(page.getByText(/ New bed created /i)).toBeVisible();
  });

  await test.step('Verify bed allocation form is filled correctly', async () => {
    await expect(wardAllocation.bedNameInput()).toHaveValue(ward1BedType.name);
  });
});

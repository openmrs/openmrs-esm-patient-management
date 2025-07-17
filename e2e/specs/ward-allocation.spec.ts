import { test, expect } from '@playwright/test';
import { WardAllocation } from '../pages/ward-allocation';
import {
  bed,
  bedType,
  createBed,
  createBedType,
  deleteBed,
  deleteBedType,
} from '../commands/ward-allocation-operation';
const bedStatus = 'Available';
test('allocate beds to wards', async ({ page, request }) => {
  const wardAllocation = new WardAllocation(page);

  // Setup test data via API
  await test.step('Setup test data', async () => {
    await createBedType(request, bedType);
    await createBed(request, bed);
  });

  await wardAllocation.goto('bed-management/bed-administration');

  await test.step('Click Add Bed button', async () => {
    await page.getByRole('button', { name: 'Add Bed' }).click();
  });

  await test.step('Fill bed ID input', async () => {
    await wardAllocation.bedIdInput().fill(bed.id.toString());
  });

  await test.step('Fill bed row input', async () => {
    await wardAllocation.bedRowInput().fill(bed.row.toString());
  });

  await test.step('Fill bed column input', async () => {
    await wardAllocation.bedColumnInput().fill(bed.column.toString());
  });

  await test.step('Select location from combo box', async () => {
    await wardAllocation.locationComboBox().click();
    await page.keyboard.type(bed.location.display);
    await page.getByRole('option', { name: new RegExp(bed.location.display, 'i') }).click();
    await page.keyboard.press('Tab');
  });

  await test.step('Select occupancy status', async () => {
    await wardAllocation.occupancyStatusSelect().selectOption({ label: bedStatus });
  });

  await test.step('Select bed type', async () => {
    await wardAllocation.bedTypeSelect().selectOption({ label: bed.bedType.name });
  });

  await test.step('Check save button enabled', async () => {
    await wardAllocation.expectSaveEnabled();
  });

  await test.step('Submit bed allocation form', async () => {
    await wardAllocation.submit();
  });

  await test.step('Verify success notification', async () => {
    await expect(page.getByText(/New bed created/i)).toBeVisible();
  });

  await test.step('Verify bed in list', async () => {
    await expect(page.getByRole('cell', { name: bed.bedNumber })).toBeVisible();
    await expect(page.getByRole('cell', { name: bedStatus })).toBeVisible();
  });

  // Cleanup
  await test.step('Cleanup test data', async () => {
    await deleteBed(request, bed.uuid);
    await deleteBedType(request, bedType.uuid);
  });
});

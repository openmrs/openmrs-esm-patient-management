import { expect } from '@playwright/test';
import { WardAllocation } from '../pages/ward-allocation';
import { bedLocation, deleteBed, deleteBedType, generateBedType, generateRandomBed } from '../commands';
import { test } from '../core';
import type { Location } from '@openmrs/esm-framework';
import { type Bed, type BedType } from '../types';

test.describe('Ward Bed Allocation', () => {
  let bed: Bed;
  let bedType: BedType;
  let location: Location;

  test.beforeEach(async ({ api }) => {
    bedType = await generateBedType(api);
    bed = await generateRandomBed(api, bedType);
    location = await bedLocation(api);
  });

  test('Create bed type and allocate ward with detailed steps', async ({ page }) => {
    const wardAllocation = new WardAllocation(page);

    await test.step('Navigate to bed types management page', async () => {
      await wardAllocation.goto('bed-management/bed-types');
    });

    await test.step('Click Add bed type button', async () => {
      await page.getByRole('button', { name: 'Add bed type' }).click();
    });

    await test.step('Fill bed name input', async () => {
      await wardAllocation.bedNameInput().fill(bedType.name);
    });

    await test.step('Fill display name input', async () => {
      await wardAllocation.displayNameInput().fill(bedType.displayName);
    });

    await test.step('Fill description input', async () => {
      await wardAllocation.descriptionInput().fill(bedType.description);
    });

    await test.step('Check save button enabled', async () => {
      await wardAllocation.expectSaveEnabled();
    });

    await test.step('Submit bed type form', async () => {
      await wardAllocation.submit();
    });

    await expect(page.getByText(bedType.displayName).nth(1)).toBeVisible();
    await expect(page.getByText(/ Bed type created/i)).toBeVisible();
  });

  test('allocate beds to wards', async ({ page }) => {
    const wardAllocation = new WardAllocation(page);
    const bedStatus = 'Available';

    await wardAllocation.goto('bed-management/bed-administration');

    await page.getByRole('button', { name: 'Add Bed' }).click();
    await wardAllocation.bedIdInput().fill(bed.id.toString(), { timeout: 5000 });
    await wardAllocation.bedRowInput().fill(bed.row.toString(), { timeout: 5000 });
    await wardAllocation.bedColumnInput().fill(bed.column.toString(), { timeout: 5000 });

    await wardAllocation.locationComboBox().click();
    await page.keyboard.type(location.display);
    await page.getByRole('option', { name: new RegExp(location.display, 'i') }).click();
    await page.keyboard.press('Tab');

    await wardAllocation.occupancyStatusSelect().selectOption({ label: bedStatus });
    await wardAllocation.bedTypeSelect().selectOption({ label: bedType.name });

    await wardAllocation.expectSaveEnabled();
    await wardAllocation.submit();

    await expect(page.getByText(/New bed created/i)).toBeVisible();
    await expect(page.getByRole('cell', { name: bed.bedNumber })).toBeVisible();
    await expect(page.getByRole('cell', { name: bedStatus })).toBeVisible();
  });

  test.afterEach(async ({ api }) => {
    await deleteBed(api, bed.uuid);
    await deleteBedType(api, bedType.uuid);
  });
});

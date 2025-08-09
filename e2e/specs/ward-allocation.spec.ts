import { type Location } from '@openmrs/esm-framework';
import { bedLocation, deleteBed, generateBedType, generateRandomBed, retireBedType } from '../commands';
import { type Bed, type BedType } from '../commands/types';
import { test } from '../core';
import { WardAllocation } from '../pages/ward-allocation-page';
import { expect } from '@playwright/test';
import { api } from '../fixtures';

let bedType: BedType;
let bed: Bed;
let location: Location;

test.beforeEach(async ({ api }) => {
  bedType = await generateBedType(api);
  location = await bedLocation(api);
  bed = await generateRandomBed(api, bedType);
});

test('I will allocate bed to a ward', async ({ page }) => {
  const wardAllocation = new WardAllocation(page);

  await test.step('I will go to the bed management page', async () => {
    await wardAllocation.goto('bed-management');
    await expect(page.locator('text=Bed management')).toBeVisible();
  });
  await test.step('I will go to the Bed type page', async () => {
    await wardAllocation.goto('bed-management/bed-types');
  });
  await test.step('i will click  Add bed type button to display its modal', async () => {
    await page.getByText('Add bed type').click();
    await expect(page.locator('text=Create bed type')).toBeVisible();
  });
  await test.step('I will enter the bed type name', async () => {
    await wardAllocation.bedNameInput().fill(bedType.name);
  });
  await test.step('I will enter the display name', async () => {
    await wardAllocation.displayNameInput().fill(bedType.displayName);
  });

  await test.step('I will enter the description and save', async () => {
    await wardAllocation.descriptionInput().fill(bedType.description);
    await wardAllocation.saveButton().click();
    await expect(page.getByText(bedType.displayName)).toBeVisible();
  });
  await test.step('I will go to the bed administration page', async () => {
    await wardAllocation.goto('bed-management/bed-administration');
  });
  await test.step('i will click add bed button and display the modal', async () => {
    await page.getByText('Add bed').click();
    await expect(page.getByText('Create a new bed')).toBeVisible();
  });
  await test.step('i will add the bed number', async () => {
    await wardAllocation.bedNumberInput().fill(bed.bedNumber);
  });
  await test.step('i will add the bed row', async () => {
    await wardAllocation.bedRowInput().fill(bed.row.toString());
  });
  await test.step('i will add the bed column', async () => {
    await wardAllocation.bedColumnInput().fill(bed.column.toString());
  });
  await test.step('i will add the bed location', async () => {
    await wardAllocation.bedLocationInput().click();
    await wardAllocation.bedLocationInput().fill(location.name);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  });
  await test.step('i will add the occupancy status', async () => {
    await wardAllocation.occupancyStatusInput().click();
    await wardAllocation.occupancyStatusInput().selectOption('Available');
  });
  await test.step('i will add the bed type', async () => {
    await wardAllocation.bedTypeInput().click();
    await wardAllocation.bedTypeInput().selectOption(bed.bedType.name);
  });
  await test.step('i will save the bed', async () => {
    await wardAllocation.saveButton().click();
  });
});
test.afterEach(async ({ api }) => {
  await retireBedType(api, bedType.uuid, 'Retired during automated testing');
  await deleteBed(api, bed);
});

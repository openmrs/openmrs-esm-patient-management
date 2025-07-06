// specs/ward-allocation.spec.ts

import { test, expect } from '@playwright/test';
import { WardAllocation } from '../pages/ward-allocation';
import { type BedStatus } from '../types';

const ward1BedType = {
  name: 'ward1-bed',
  displayName: 'Ward 1 Bed',
  description: 'Standard bed in Ward 1',
};

const ward1Status: BedStatus = 'Available';
const ward1BedLayout = {
  bedId: 301,
  bedNumber: '301A',
  bedUuid: 'uuid-ward1-bed',
  rowNumber: 1,
  columnNumber: 1,
  location: 'Ward 1',
  status: ward1Status,
  bedType: ward1BedType,
};

const inpatientWardStatus: BedStatus = 'Available';

const inpatientBedType = {
  name: 'inpatient-bed',
  displayName: 'ward 2 Bed',
  description: 'Bed for inpatient ward',
};
const inpatientBedLayout = {
  bedId: 302,
  bedNumber: '302A',
  bedUuid: 'uuid-inpatient-bed',
  rowNumber: 2,
  columnNumber: 1,
  location: 'Inpatient Ward',
  status: inpatientWardStatus,
  bedType: inpatientBedType,
};

test('create Bed types', async ({ page }) => {
  const wardAllocation = new WardAllocation(page);
  await wardAllocation.goto('bed-management/bed-types');

  // Create Ward 1 Bed Type
  await page.getByRole('button', { name: 'Add bed type' }).click();
  await wardAllocation.createBedType(ward1BedType);
  await wardAllocation.expectSaveEnabled();
  await wardAllocation.submit();

  // Create Inpatient Ward Bed Type
  await page.getByRole('button', { name: 'Add bed type' }).click();
  await wardAllocation.createBedType(inpatientBedType);
  await wardAllocation.expectSaveEnabled();
  await wardAllocation.submit();

  await expect(page.getByText('ward1-bed').nth(1)).toBeVisible();
  await expect(page.getByText('inpatient-bed').nth(1)).toBeVisible();
});
test('allocate beds to wards', async ({ page }) => {
  const wardAllocation = new WardAllocation(page);
  await wardAllocation.goto('bed-management/bed-administration');

  // Allocate Ward 1 Bed
  await page.getByRole('button', { name: 'Add Bed' }).click();
  await wardAllocation.allocateWard(ward1BedLayout);
  await wardAllocation.expectSaveEnabled();
  await wardAllocation.submit();

  // Allocate Inpatient Ward Bed
  await page.getByRole('button', { name: 'Add Bed' }).click();
  await wardAllocation.allocateWard(inpatientBedLayout);
  await wardAllocation.expectSaveEnabled();
  await wardAllocation.submit();
  await expect(page.getByText('301').nth(1)).toBeVisible();
  await expect(page.getByText('302').nth(1)).toBeVisible();
});

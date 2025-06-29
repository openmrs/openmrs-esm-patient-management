// specs/ward-allocation.spec.ts

import { test, expect } from '@playwright/test';
import { WardAllocation } from '../pages/ward-allocation';
import { type BedStatus } from '../types';

test.beforeEach(async ({ page }) => {
  const wardPage = new WardAllocation(page);
  await wardPage.goto('bed-management');
});

test('create  beds and wards', async ({ page }) => {
  const wardPage = new WardAllocation(page);

  const ward1BedType = {
    name: 'ward1-bed',
    displayName: 'Ward 1 Bed',
    description: 'Standard bed in Ward 1',
  };

  const ward1Status: BedStatus = 'AVAILABLE';
  const ward1BedLayout = {
    bedId: 301,
    bedNumber: '301A',
    bedUuid: 'uuid-ward1-bed',
    rowNumber: 1,
    columnNumber: 1,
    location: 'ward1',
    status: ward1Status,
    bedType: ward1BedType,
  };

  await wardPage.allocateWard(ward1BedLayout);

  // Verify inputs filled correctly (optional)
  await expect(wardPage.bedNameInput()).toHaveValue(ward1BedType.name);
  await expect(wardPage.bedIdInput()).toHaveValue(ward1BedLayout.bedId.toString());
  await expect(wardPage.locationSelect()).toHaveValue(ward1BedLayout.location);

  const inpatientWardStatus: BedStatus = 'AVAILABLE';

  const inpatientBedType = {
    name: 'inpatient-bed',
    displayName: 'Inpatient Ward Bed',
    description: 'Bed for inpatient ward',
  };
  const inpatientBedLayout = {
    bedId: 302,
    bedNumber: '302A',
    bedUuid: 'uuid-inpatient-bed',
    rowNumber: 2,
    columnNumber: 1,
    location: 'inpatient-ward',
    status: inpatientWardStatus,
    bedType: inpatientBedType,
  };

  await wardPage.goto('bed-management/bed-types');
  await page.getByText('Add bed type').click();
  await wardPage.createBedType(ward1BedType);
  await page.getByText('save').click();

  await wardPage.goto('bed-management/bed-types');
  await page.getByText('Add bed type').click();
  await wardPage.createBedType(inpatientBedType);
  await page.getByText('save').click();

  await expect(wardPage.bedNameInput()).toHaveValue(ward1BedType.name);
  await expect(wardPage.bedIdInput()).toHaveValue(ward1BedLayout.bedId.toString());
  await expect(wardPage.locationSelect()).toHaveValue(ward1BedLayout.location);

  await wardPage.goto('bed-management/bed-administration');
  await page.getByText('Add bed').click();
  await wardPage.allocateWard(ward1BedLayout);
  await page.getByText('save').click();

  await wardPage.goto('bed-management/bed-administration');
  await page.getByText('Add bed').click();
  await wardPage.allocateWard(inpatientBedLayout);
  await page.getByText('save').click();
});

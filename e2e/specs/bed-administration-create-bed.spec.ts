import { expect } from '@playwright/test';
import { type Location } from '@openmrs/esm-framework';
import { bedLocation, deleteBed, retireBedType } from '../commands';
import { test } from '../core';
import { type BedTag, type Bed, type BedType } from '../commands/types';
import { BedAdministrationPage } from '../pages/bed-administration-page';

let bed: Bed;
let bedTag: BedTag;
let bedType: BedType;
let location: Location;

test.beforeEach(async ({ api }) => {
  location = await bedLocation(api);
});

test('Create a bed with a type, tag and location', async ({ page }) => {
  const bedAdministration = new BedAdministrationPage(page);

  await test.step('When I visit the Bed management page', async () => {
    await bedAdministration.openBedManagement();
    await expect(page.locator('text=Bed management')).toBeVisible();
  });

  await test.step('And I open the Bed tags page', async () => {
    await bedAdministration.openBedTags();
  });

  await test.step('And I create a bed tag', async () => {
    const uniqueTagName = `Tag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    await page.getByRole('button', { name: /create bed tag/i }).click();
    await bedAdministration.bedTagNameInput().fill(uniqueTagName);
    const bedTagResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/bedTag') && res.request().method() === 'POST',
    );
    await bedAdministration.saveButton().click();
    const bedTagResponse = await bedTagResponsePromise;
    const bedTagBody = await bedTagResponse.json();
    expect(bedTagBody.uuid, 'Expected bed tag POST response to include UUID').toBeTruthy();
    await expect(page.getByText(uniqueTagName).first()).toBeVisible();
    bedTag = { name: uniqueTagName, uuid: bedTagBody.uuid } as BedTag;
  });

  await test.step('And I open the Bed types page', async () => {
    await bedAdministration.openBedTypes();
  });

  await test.step('And I click the "Add bed type" button', async () => {
    await page.getByRole('button', { name: /add bed type/i }).click();
    await expect(page.getByText(/create bed type/i)).toBeVisible();
  });

  await test.step('And I enter the bed type details and save', async () => {
    const uniqueTypeName = `Type_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const displayName = uniqueTypeName.slice(0, 10);
    const description = `E2E ${uniqueTypeName}`;
    await bedAdministration.bedNameInput().fill(uniqueTypeName);
    await bedAdministration.displayNameInput().fill(displayName);
    await bedAdministration.descriptionInput().fill(description);
    const bedTypeResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/bedtype') && res.request().method() === 'POST',
    );
    await bedAdministration.saveButton().click();
    const bedTypeResponse = await bedTypeResponsePromise;
    const bedTypeBody = await bedTypeResponse.json();
    expect(bedTypeBody.uuid, 'Expected bed type POST response to include UUID').toBeTruthy();
    await expect(page.getByText(displayName).first()).toBeVisible();
    bedType = { name: uniqueTypeName, displayName, description, uuid: bedTypeBody.uuid } as BedType;
  });

  await test.step('And I open the Bed administration page', async () => {
    await bedAdministration.openBedAdministration();
  });

  await test.step('And I click the "Add bed" button', async () => {
    await page
      .locator('[class*="headerActions"]')
      .getByRole('button', { name: /^Add bed$/ })
      .click();
  });

  await test.step('And I enter the bed number, row and column', async () => {
    const bedNumber = `B_${Date.now().toString().slice(-6)}`.slice(0, 10);
    await bedAdministration.bedNumberInput().fill(bedNumber);
    await bedAdministration.bedRowInput().fill('1');
    await bedAdministration.bedColumnInput().fill('1');
    bed = { bedNumber } as Bed;
  });

  await test.step('And I select the bed location', async () => {
    await bedAdministration.bedLocationInput().click();
    await bedAdministration.bedLocationInput().fill(location.name);
    await page.getByRole('listbox').waitFor({ state: 'visible' });
    await page.getByRole('option', { name: location.name, exact: true }).first().click();
  });

  await test.step('And I select the occupancy status', async () => {
    await bedAdministration.occupancyStatusInput().selectOption({ value: 'AVAILABLE' });
  });

  await test.step('And I select the bed type', async () => {
    await bedAdministration.bedTypeInput().selectOption(bedType.name);
  });

  await test.step('And I select the bed tag', async () => {
    await bedAdministration.bedTagsMultiSelect().click();
    await page.getByText(bedTag.name, { exact: true }).first().click();
    await page.keyboard.press('Tab');
  });

  await test.step('Then I should see the new bed listed with correct details', async () => {
    const bedResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/bed') && res.request().method() === 'POST',
    );
    await bedAdministration.saveAndCloseButton().click();
    const bedResponse = await bedResponsePromise;
    const bedBody = await bedResponse.json();
    expect(bedBody.uuid, 'Expected bed POST response to include UUID').toBeTruthy();
    const table = page.getByRole('table');
    await expect(table).toContainText(bed.bedNumber);
    (bed as any).uuid = bedBody.uuid as string;
  });
});

test.afterEach(async ({ api }) => {
  if (bedType?.uuid) {
    await retireBedType(api, bedType.uuid, 'Retired during automated testing');
  }
  if (bed?.uuid) {
    await deleteBed(api, bed);
  }
});

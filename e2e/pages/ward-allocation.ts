import { type Page, expect } from '@playwright/test';
import { type BedLayout, BedStatus, type BedType } from '../types';

export class WardAllocation {
  constructor(readonly page: Page) {}

  get bedNameInput() {
    return this.page.locator('#bedName');
  }

  get displayNameInput() {
    return this.page.locator('#displayName');
  }

  get descriptionInput() {
    return this.page.locator('#description');
  }

  get bedIdInput() {
    return this.page.locator('#bedId');
  }

  get bedRowInput() {
    return this.page.locator('#bedRow');
  }

  get bedColumnInput() {
    return this.page.locator('#bedColumn');
  }

  get locationComboBox() {
    return this.page.getByRole('combobox', { name: /location/i });
  }

  get occupancyStatusSelect() {
    return this.page.locator('#occupiedStatus');
  }

  get bedTypeSelect() {
    return this.page.locator('#bedType');
  }

  // ----- Buttons -----
  get saveButton() {
    return this.page.getByRole('button', { name: /save/i });
  }

  get cancelButton() {
    return this.page.getByRole('button', { name: /cancel/i });
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async createBedType(bedType: BedType) {
    await this.bedNameInput.fill(bedType.name);
    await this.displayNameInput.fill(bedType.displayName);
    await this.descriptionInput.fill(bedType.description);
  }

  async allocateWard(bedLayout: BedLayout) {
    await this.bedIdInput.fill(bedLayout.bedId.toString());
    await this.bedRowInput.fill(bedLayout.rowNumber.toString());
    await this.bedColumnInput.fill(bedLayout.columnNumber.toString());

    await this.locationComboBox.click();
    await this.page.keyboard.type(bedLayout.location);
    await this.page.getByRole('option', { name: new RegExp(bedLayout.location, 'i') }).click();
    await this.page.keyboard.press('Tab');
    // Handle Select for occupancyStatus
    await this.occupancyStatusSelect.click();
    await this.occupancyStatusSelect.selectOption({ label: bedLayout.status });
    await this.page.keyboard.press('Tab');
    await this.bedTypeSelect.click();
    await this.bedTypeSelect.selectOption({ label: bedLayout.bedType.name });
  }

  async submit() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expectSaveEnabled(enabled = true) {
    if (enabled) {
      await expect(this.saveButton).toBeEnabled();
    } else {
      await expect(this.saveButton).toBeDisabled();
    }
  }
}

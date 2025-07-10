import { type Page, expect } from '@playwright/test';
import { type BedLayout, BedStatus, type BedType } from '../types';

export class WardAllocation {
  constructor(readonly page: Page) {}

  readonly bedNameInput = () => {
    return this.page.locator('#bedName');
  };

  readonly displayNameInput = () => {
    return this.page.locator('#displayName');
  };

  readonly descriptionInput = () => {
    return this.page.locator('#description');
  };

  readonly bedIdInput = () => {
    return this.page.locator('#bedId');
  };

  readonly bedRowInput = () => {
    return this.page.locator('#bedRow');
  };

  readonly bedColumnInput = () => {
    return this.page.locator('#bedColumn');
  };

  readonly locationComboBox = () => {
    return this.page.getByRole('combobox', { name: /location/i });
  };

  readonly occupancyStatusSelect = () => {
    return this.page.locator('#occupiedStatus');
  };

  readonly bedTypeSelect = () => {
    return this.page.locator('#bedType');
  };

  readonly saveButton = () => {
    return this.page.getByRole('button', { name: 'Save' });
  };

  readonly cancelButton = () => {
    return this.page.getByRole('button', { name: 'Cancel' });
  };

  async goto(url: string) {
    await this.page.goto(url);
  }

  async submit() {
    await this.saveButton().click();
  }

  async cancel() {
    await this.cancelButton().click();
  }

  async expectSaveEnabled(enabled = true) {
    if (enabled) {
      await expect(this.saveButton()).toBeEnabled();
    } else {
      await expect(this.saveButton()).toBeDisabled();
    }
  }
}

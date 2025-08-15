import { type Page } from '@playwright/test';

export class BedAdministrationPage {
  constructor(readonly page: Page) {}

  async goto(url: string) {
    await this.page.goto(url);
  }

  async openBedAdministration() {
    await this.goto('bed-management/bed-administration');
  }

  async openBedManagement() {
    await this.goto('bed-management');
  }

  async openBedTags() {
    await this.goto('bed-management/bed-tags');
  }

  async openBedTypes() {
    await this.goto('bed-management/bed-types');
  }

  readonly bedTagNameInput = () => this.page.locator('#bedTag');
  readonly bedNumberInput = () => this.page.locator('#bedNumber');
  readonly bedRowInput = () => this.page.locator('#bedRow');
  readonly bedColumnInput = () => this.page.locator('#bedColumn');
  readonly bedLocationInput = () => this.page.locator('#location');
  readonly occupancyStatusInput = () => this.page.locator('form select#occupancyStatus');
  readonly bedTypeInput = () => this.page.locator('#bedType');
  readonly bedTagsMultiSelect = () => this.page.locator('#bedTags');
  readonly bedNameInput = () => this.page.locator('#bedName');
  readonly displayNameInput = () => this.page.locator('#displayName');
  readonly descriptionInput = () => this.page.locator('#description');
  readonly saveAndCloseButton = () => this.page.getByRole('button', { name: /Save & close/i });
  readonly saveButton = () => this.page.getByRole('button', { name: /Save/i });
}

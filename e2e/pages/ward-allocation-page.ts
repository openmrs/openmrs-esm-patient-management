import { type Page } from '@playwright/test';

export class WardAllocation {
  constructor(readonly page: Page) {}

  async goto(url: string) {
    await this.page.goto(url);
  }
  //Fetch bed Administration form locators
  readonly bedNumberInput = () => this.page.locator('#bedId');
  readonly bedRowInput = () => this.page.locator('#bedRow');
  readonly bedColumnInput = () => this.page.locator('#bedColumn');
  readonly bedLocationInput = () => this.page.locator('#location');
  readonly occupancyStatusInput = () => this.page.locator('#occupyStatus');
  readonly bedTypeInput = () => this.page.locator('#bedType');

  //Fetch bed administration table locators
  readonly bedTable = () => this.page.getByTitle('BedTypes');

  //Fetch bed type administration form locators
  readonly bedNameInput = () => this.page.locator('#bedName');
  readonly displayNameInput = () => this.page.locator('#displayName');
  readonly descriptionInput = () => this.page.locator('#description');

  //Fetch bed type administration table locators
  readonly getBedTypeTable = () => this.page.getByText('Bed types');

  readonly cancelButton = () => this.page.getByRole('button', { name: 'Cancel' });
  readonly saveButton = () => this.page.getByRole('button', { name: 'Save' });
}

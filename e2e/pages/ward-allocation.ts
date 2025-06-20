import { type Page } from '@playwright/test';
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
  readonly locationSelect = () => {
    return this.page.locator('#location');
  };
  readonly occupancyStatusSelect = () => {
    return this.page.locator('#occupancyStatus');
  };
  readonly bedTypeSelect = () => {
    return this.page.locator('#bedType');
  };

  async goto(url: string) {
    return await this.page.goto(url);
  }
  async createBedType(bedType: BedType) {
    await this.bedNameInput().fill(bedType.name);
    await this.displayNameInput().fill(bedType.displayName);
    await this.descriptionInput().fill(bedType.description);
  }

  async allocateWard(bedLayout: BedLayout) {
    await this.bedIdInput().fill(bedLayout.bedId.toString());
    await this.bedRowInput().fill(bedLayout.rowNumber.toString());
    await this.bedColumnInput().fill(bedLayout.columnNumber.toString());
    await this.locationSelect().selectOption(bedLayout.location);
    await this.occupancyStatusSelect().selectOption(bedLayout.status);
    await this.bedTypeSelect().selectOption(bedLayout.bedType.name);
  }
}

import { type Page } from '@playwright/test';

export class WardAppPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto(`home/ward`);
  }
}

import { Page } from '@playwright/test';

export class OfflineActionsPage {
  constructor(readonly page: Page) {}

  readonly updateButton = () => this.page.locator('text=Update offline patients');
  readonly syncFinishedModal = () => this.page.locator('text=The offline action synchronization has finished.');

  async goto() {
    await this.page.goto('offline-tools/actions');
  }

  async sync() {
    await this.updateButton().click();
    await this.syncFinishedModal().waitFor({ state: 'visible' });
  }
}

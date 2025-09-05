import { type Page } from '@playwright/test';

export class PatientBedSwapPage {
  constructor(readonly page: Page) {}
  async goto(url: string) {
    await this.page.goto(url);
  }
  async openWardPage() {
    await this.goto('home/ward');
  }
  readonly transferButton = () => this.page.getByRole('button', { name: 'Transfers' });
  readonly swapButton = () => this.page.getByRole('button', { name: 'Bed swap' });
  readonly saveButton = () => this.page.getByRole('button', { name: /Save/i });
}

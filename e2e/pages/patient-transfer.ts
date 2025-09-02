import { type Page } from '@playwright/test';

export class PatientTransferPage {
  constructor(readonly page: Page) {}
  async goto(url: string) {
    await this.page.goto(url);
  }
  async openWardPage() {
    await this.goto('home/ward');
  }
  readonly transferButton = () => this.page.getByRole('button', { name: 'Transfers' });
  readonly searchInput = () => this.page.getByPlaceholder('Search locations');
  readonly textArea = () => this.page.getByRole('textbox', { name: 'Notes' });
  readonly saveButton = () => this.page.getByRole('button', { name: /Save/i });
}

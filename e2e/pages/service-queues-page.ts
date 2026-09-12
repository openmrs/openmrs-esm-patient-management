import { type Page } from '@playwright/test';

export class ServiceQueuesPage {
  constructor(readonly page: Page) {}

  readonly queuesTable = () => this.page.getByTestId('table');

  async goto() {
    await this.page.goto(`${process.env.E2E_BASE_URL}/spa/home/service-queues`);
  }

  // The e2e user is a System Developer, so it holds the clinic administrator privilege and the waiting
  // list sits behind the second tab rather than being the whole dashboard.
  async gotoWaitingList() {
    await this.goto();
    await this.page.getByRole('tab', { name: /waiting list/i }).click();
  }
}

import { type Page } from '@playwright/test';

export class ServiceQueuesPage {
  constructor(readonly page: Page) {}

  readonly queuesTable = () => this.page.getByTestId('table');

  async goto() {
    await this.page.goto(`${process.env.E2E_BASE_URL}/spa/home/service-queues`);
  }
}

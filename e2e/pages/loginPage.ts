import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(readonly page: Page) {}

  readonly usernameInput = () => this.page.locator('#username');
  readonly passwordInput = () => this.page.locator('#password');
  readonly continueButton = () => this.page.locator('text=Continue');
  readonly logInButton = () => this.page.locator('text=Log in');
  readonly locationOption = (locationName: string) => this.page.locator(`text=${locationName}`);
  readonly confirmLocationButton = () => this.page.locator('text=Confirm');

  async goto(subsection: '' | 'confirm' | 'location' = '') {
    await this.page.goto(`login/${subsection}`);
  }

  async login(username: string, password: string, locationName: string) {
    await this.usernameInput().fill(username);
    await this.continueButton().click();

    await this.passwordInput().fill(password);
    await this.logInButton().click();

    await this.locationOption(locationName).check();
    await this.confirmLocationButton().click();
  }
}

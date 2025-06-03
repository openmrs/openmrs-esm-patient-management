import { type Page, expect } from '@playwright/test';
import { type PatientRegistrationSex } from '../types';

export class RegistrationAndEditPage {
  constructor(readonly page: Page) {}

  readonly givenNameInput = () => this.page.locator('#givenName');
  readonly middleNameInput = () => this.page.locator('#middleName');
  readonly familyNameInput = () => this.page.locator('#familyName');
  readonly sexRadioButton = (sex: PatientRegistrationSex) => this.page.locator(`label[for=gender-option-${sex}]`);
  readonly birthDateInput = () => this.page.locator('#birthdate');
  readonly birthdateDayInput = () => this.birthDateInput().locator('[data-type="day"]');
  readonly birthdateMonthInput = () => this.birthDateInput().locator('[data-type="month"]');
  readonly addressHierarchySearchInput = () => this.page.getByPlaceholder(/search address/i);
  readonly birthdateYearInput = () => this.birthDateInput().locator('[data-type="year"]');
  readonly address1Input = () => this.page.locator('#address1');
  readonly countryInput = () => this.page.locator('#country');
  readonly countyDistrictInput = () => this.page.locator('#countyDistrict');
  readonly stateProvinceInput = () => this.page.locator('#stateProvince');
  readonly cityVillageInput = () => this.page.locator('#cityVillage');
  readonly phoneInput = () => this.page.locator('#phone');
  readonly emailInput = () => this.page.locator('#email');
  readonly createPatientButton = () => this.page.locator('button[type=submit]');

  async goto(editPatientUuid?: string) {
    await this.page.goto(editPatientUuid ? `patient/${editPatientUuid}/edit` : 'patient-registration');
  }

  async waitUntilTheFormIsLoaded() {
    await expect(this.createPatientButton()).toBeEnabled();
  }
}

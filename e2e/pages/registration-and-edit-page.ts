import { Locator, Page, expect } from '@playwright/test';

export type PatientRegistrationSex = 'male' | 'female' | 'other' | 'unknown';

export interface PatientRegistrationFormValues {
  givenName?: string;
  middleName?: string;
  familyName?: string;
  sex?: PatientRegistrationSex;
  birthdate?: string;
  postalCode?: string;
  address1?: string;
  address2?: string;
  country?: string;
  countyDistrict?: string;
  stateProvince?: string;
  cityVillage?: string;
  phone?: string;
  email?: string;
}

export class RegistrationAndEditPage {
  constructor(readonly page: Page) {}

  readonly givenNameInput = () => this.page.locator('#givenName');
  readonly middleNameInput = () => this.page.locator('#middleName');
  readonly familyNameInput = () => this.page.locator('#familyName');
  readonly sexRadioButton = (sex: PatientRegistrationSex) => this.page.locator(`label[for=${sex}]`);
  readonly birthdateInput = () => this.page.locator('#birthdate');
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

  async fillPatientRegistrationForm(formValues: PatientRegistrationFormValues) {
    const tryFill = (locator: Locator, value?: string) => value && locator.fill(value);
    formValues.sex && (await this.sexRadioButton(formValues.sex).check());
    await tryFill(this.givenNameInput(), formValues.givenName);
    await tryFill(this.middleNameInput(), formValues.middleName);
    await tryFill(this.familyNameInput(), formValues.familyName);
    await tryFill(this.birthdateInput(), formValues.birthdate);
    await tryFill(this.phoneInput(), formValues.phone);
    await tryFill(this.emailInput(), formValues.email);
    await tryFill(this.address1Input(), formValues.address1);
    await tryFill(this.stateProvinceInput(), formValues.stateProvince);
    await tryFill(this.cityVillageInput(), formValues.cityVillage);
    await tryFill(this.countryInput(), formValues.country);
    await tryFill(this.countyDistrictInput(), formValues.countyDistrict);
    await this.createPatientButton().click();
  }
}

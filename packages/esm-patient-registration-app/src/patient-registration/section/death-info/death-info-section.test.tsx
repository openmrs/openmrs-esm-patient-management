import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { initialFormValues } from '../../patient-registration.component';
import { DeathInfoSection } from './death-info-section.component';
import { FormValues } from '../../patient-registration-types';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    validator: jest.fn(),
  };
});

// TODO: Implement feature and get tests to pass
describe.skip('death info section', () => {
  const formValues: FormValues = initialFormValues;

  const setupSection = async (isDead?: boolean) => {
    render(
      <Formik initialValues={{ ...initialFormValues, isDead }} onSubmit={null}>
        <Form>
          <DeathInfoSection />
        </Form>
      </Formik>,
    );
    const allInputs = screen.queryAllByLabelText(
      (content, element) => element.tagName.toLowerCase() === 'input',
    ) as Array<HTMLInputElement>;
    const allSelects = screen.queryAllByRole('combobox') as Array<HTMLInputElement>;
    let inputAndSelectNames = [];
    allInputs.forEach((input) => inputAndSelectNames.push(input.name));
    allSelects.forEach((select) => inputAndSelectNames.push(select.name));
    return inputAndSelectNames;
  };

  it('has the correct number of inputs if is dead is checked', async () => {
    const inputAndSelectNames = await setupSection(true);
    expect(inputAndSelectNames.length).toBe(3);
  });

  it('has the correct number of inputs if is dead is not checked', async () => {
    const inputAndSelectNames = await setupSection(false);
    expect(inputAndSelectNames.length).toBe(1);
  });

  it('has isDead checkbox', async () => {
    const inputAndSelectNames = await setupSection();
    expect(inputAndSelectNames).toContain('isDead');
  });

  it('has death date if is dead is checked', async () => {
    const inputAndSelectNames = await setupSection(true);
    expect(inputAndSelectNames).toContain('deathDate');
  });

  it('has no death date if is dead is not checked', async () => {
    const inputAndSelectNames = await setupSection(false);
    expect(inputAndSelectNames).not.toContain('deathDate');
  });

  it('has death cause if is dead is checked', async () => {
    const inputAndSelectNames = await setupSection(true);
    expect(inputAndSelectNames).toContain('deathCause');
  });

  it('has no death cause if is dead is not checked', async () => {
    const inputAndSelectNames = await setupSection(false);
    expect(inputAndSelectNames).not.toContain('deathCause');
  });
});

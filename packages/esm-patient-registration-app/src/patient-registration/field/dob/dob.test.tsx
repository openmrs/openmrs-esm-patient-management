import React from 'react';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { DobField } from './dob.component';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

describe('Dob', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        dateOfBirth: {
          allowEstimatedDateOfBirth: true,
          useEstimatedDateOfBirth: { enabled: true, dayOfMonth: 0, month: 0 },
        },
      } as RegistrationConfig['fieldConfigurations'],
    });
  });

  it('renders the fields in the birth section of the registration form', async () => {
    render(
      <Formik initialValues={{ birthdate: '' }} onSubmit={() => {}}>
        <Form>
          <PatientRegistrationContext.Provider
            value={{
              identifierTypes: [],
              values: initialFormValues,
              validationSchema: null,
              inEditMode: false,
              setFieldValue: () => {},
              setCapturePhotoProps: (value) => {},
              currentPhoto: '',
              isOffline: false,
              initialFormValues: initialFormValues,
              setFieldTouched: () => {},
            }}>
            <DobField />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('heading', { name: /birth/i })).toBeInTheDocument();
    expect(screen.getByText(/date of birth known?/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /no/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /yes/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /no/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('group', { name: /date of birth/i })).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', {
        name: /day, date of birth/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', {
        name: /month, date of birth/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', {
        name: /year, date of birth/i,
      }),
    ).toBeInTheDocument();
  });

  it('typing in the date picker input sets the date of birth', async () => {
    const user = userEvent.setup();

    render(
      <Formik initialValues={{ birthdate: '' }} onSubmit={() => {}}>
        <Form>
          <PatientRegistrationContext.Provider
            value={{
              identifierTypes: [],
              values: initialFormValues,
              validationSchema: null,
              inEditMode: false,
              setFieldValue: () => {},
              setCapturePhotoProps: (value) => {},
              currentPhoto: '',
              isOffline: false,
              initialFormValues: initialFormValues,
              setFieldTouched: () => {},
            }}>
            <DobField />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>,
    );

    const dateOfBirthInput = screen.getByRole('group', { name: /date of birth/i });
    expect(dateOfBirthInput).toBeInTheDocument();

    const dateInput = screen.getByRole('spinbutton', {
      name: /day, date of birth/i,
    });
    expect(dateInput).toBeInTheDocument();
    const monthInput = screen.getByRole('spinbutton', {
      name: /month, date of birth/i,
    });
    expect(monthInput).toBeInTheDocument();
    const yearInput = screen.getByRole('spinbutton', {
      name: /year, date of birth/i,
    });
    expect(yearInput).toBeInTheDocument();
    // FIXME: When typing in the year the month and date inputs revert back to the placeholders
    // and the display becomes dd/mm/2022
    // which is why they are tested in three separate steps rather than altogether
    await user.clear(dateInput);
    await user.type(dateInput, '10');
    expect(dateInput).toHaveTextContent('10');
    await user.clear(monthInput);
    await user.type(monthInput, '10');
    expect(monthInput).toHaveTextContent('10');
    await user.clear(yearInput);
    await user.type(yearInput, '2022');
    expect(yearInput).toHaveTextContent('2022');
  });
});

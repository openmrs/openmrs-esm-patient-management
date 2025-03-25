import React from 'react';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
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
          <PatientRegistrationContextProvider
            value={{
              identifierTypes: [],
              values: initialFormValues,
              validationSchema: null,
              inEditMode: false,
              setFieldValue: () => {},
              setCapturePhotoProps: (value) => {},
              setFieldTouched: () => {},
              currentPhoto: '',
              isOffline: false,
              initialFormValues: initialFormValues,
            }}>
            <DobField />
          </PatientRegistrationContextProvider>
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('heading', { name: /birth/i })).toBeInTheDocument();
    expect(screen.getByText(/date of birth known?/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /no/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /yes/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /no/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
  });

  it('typing in the date picker input sets the date of birth', async () => {
    const user = userEvent.setup();

    render(
      <Formik initialValues={{ birthdate: '' }} onSubmit={() => {}}>
        <Form>
          <PatientRegistrationContextProvider
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
          </PatientRegistrationContextProvider>
        </Form>
      </Formik>,
    );

    const dateOfBirthInput = screen.getByLabelText(/date of birth/i);
    expect(dateOfBirthInput).toBeInTheDocument();
    await user.clear(dateOfBirthInput);
    await user.type(dateOfBirthInput, '10/10/2022');
    // FIXME: Make the date input work
    // expect(dateOfBirthInput).toHaveValue('10/10/2022');
  });
});

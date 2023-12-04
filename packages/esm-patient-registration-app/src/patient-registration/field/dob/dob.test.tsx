import React from 'react';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import { DobField } from './dob.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    useConfig: jest.fn().mockImplementation(() => ({
      fieldConfigurations: {
        dateOfBirth: {
          allowEstimatedDateOfBirth: true,
          useEstimatedDateOfBirth: { enabled: true, dayOfMonth: 0, month: 0 },
        },
      },
    })),
  };
});

describe('Dob', () => {
  it('renders the fields in the birth section of the registration form', async () => {
    renderDob();

    expect(screen.getByRole('heading', { name: /birth/i })).toBeInTheDocument();
    expect(screen.getByText(/date of birth known?/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /no/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /yes/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /no/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('textbox', { name: /date of birth/i })).toBeInTheDocument();
  });

  it('typing in the date picker input sets the date of birth', async () => {
    const user = userEvent.setup();

    renderDob();

    const dateInput = screen.getByRole('textbox', { name: /date of birth/i });
    expect(dateInput).toBeInTheDocument();

    await user.type(dateInput, '10/10/2022');

    expect(screen.getByPlaceholderText('dd/mm/YYYY')).toHaveValue('10/10/2022');
  });
});

function renderDob() {
  let formValues: FormValues = initialFormValues;

  render(
    <Formik initialValues={{ birthdate: '' }} onSubmit={() => {}}>
      <Form>
        <PatientRegistrationContext.Provider
          value={{
            identifierTypes: [],
            values: formValues,
            validationSchema: null,
            setValidationSchema: (value) => {},
            inEditMode: false,
            setFieldValue: () => {},
            setCapturePhotoProps: (value) => {},
            currentPhoto: '',
            isOffline: false,
            initialFormValues: formValues,
          }}>
          <DobField />
        </PatientRegistrationContext.Provider>
      </Form>
    </Formik>,
  );
}

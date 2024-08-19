import React from 'react';
import dayjs from 'dayjs';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { DobField } from './dob.component';

const mockOpenmrsDatePicker = jest.mocked(OpenmrsDatePicker);
const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

mockOpenmrsDatePicker.mockImplementation(({ id, labelText, value, onChange }) => {
  return (
    <>
      <label htmlFor={id}>{labelText}</label>
      <input
        id={id}
        // @ts-ignore
        value={value ? dayjs(value).format('DD/MM/YYYY') : ''}
        onChange={(evt) => {
          onChange(dayjs(evt.target.value).toDate());
        }}
      />
    </>
  );
});

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
    expect(screen.getByRole('textbox', { name: /date of birth/i })).toBeInTheDocument();
  });

  // TODO O3-3482: Fix this test case.
  // Disabling this test case for now as it doesn't work as expected when mocking the date picker
  it.skip('typing in the date picker input sets the date of birth', async () => {
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
            }}>
            <DobField />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>,
    );

    const dateInput = screen.getByLabelText(/Date of birth/i);
    expect(dateInput).toBeInTheDocument();

    await user.type(dateInput, '10/10/2022');
    expect(screen.getByPlaceholderText('dd/mm/YYYY')).toHaveValue('10/10/2022');
  });
});

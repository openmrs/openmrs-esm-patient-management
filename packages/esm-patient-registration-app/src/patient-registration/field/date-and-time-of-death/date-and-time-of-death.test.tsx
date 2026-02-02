import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { DateAndTimeOfDeathField } from './date-and-time-of-death.component';
import { type FormValues } from '../../patient-registration.types';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

/**
 * Helper to render DateAndTimeOfDeathField with Formik render props for state-dependent tests.
 */
const renderDateAndTimeOfDeathFieldWithFormik = (
  initialValues: Partial<FormValues> = {},
  options?: { enableReinitialize?: boolean },
) => {
  const defaultValues = {
    deathDate: '',
    deathTime: '',
    deathTimeFormat: 'AM' as const,
    isDead: false,
    ...initialValues,
  };

  let formValuesRef: FormValues = { ...initialFormValues, ...defaultValues } as FormValues;

  const utils = render(
    <Formik initialValues={defaultValues} onSubmit={() => {}} enableReinitialize={options?.enableReinitialize}>
      {({ setFieldValue, values, setFieldTouched }) => {
        formValuesRef = { ...initialFormValues, ...values } as FormValues;
        return (
          <Form>
            <PatientRegistrationContextProvider
              value={{
                identifierTypes: [],
                values: formValuesRef,
                validationSchema: null,
                inEditMode: false,
                setFieldValue: setFieldValue as any,
                setCapturePhotoProps: jest.fn(),
                setFieldTouched: setFieldTouched as any,
                currentPhoto: '',
                isOffline: false,
                initialFormValues: formValuesRef,
              }}>
              <DateAndTimeOfDeathField />
            </PatientRegistrationContextProvider>
          </Form>
        );
      }}
    </Formik>,
  );

  return {
    ...utils,
    getFormValues: () => formValuesRef,
  };
};

describe('DateAndTimeOfDeathField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
    });
  });

  it('renders the date and time of death field with label', () => {
    renderDateAndTimeOfDeathFieldWithFormik();

    expect(screen.getByRole('heading', { name: /date of death/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/date of death/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of death/i)).toBeInTheDocument();
  });

  describe('Date of death', () => {
    it('sets death date when user enters a date', async () => {
      const { getFormValues } = renderDateAndTimeOfDeathFieldWithFormik({ isDead: true });

      const dateInput = screen.getByLabelText(/date of death/i) as HTMLInputElement;
      const deathDateString = '2020-01-15';

      fireEvent.change(dateInput, { target: { value: deathDateString } });
      fireEvent.blur(dateInput);

      await waitFor(() => {
        expect(getFormValues().deathDate).toBeTruthy();
      });
    });

    it('renders date picker when isDead is true', () => {
      renderDateAndTimeOfDeathFieldWithFormik({ isDead: true });

      // Verify date picker is rendered (OpenmrsDatePicker uses isRequired prop, not HTML required attribute)
      const dateInput = screen.getByLabelText(/date of death/i);
      expect(dateInput).toBeInTheDocument();
    });

    it('renders date picker when isDead is false', () => {
      renderDateAndTimeOfDeathFieldWithFormik({ isDead: false });

      const dateInput = screen.getByLabelText(/date of death/i);
      expect(dateInput).toBeInTheDocument();
    });
  });

  describe('Time of death', () => {
    it('allows user to enter time of death', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderDateAndTimeOfDeathFieldWithFormik();

      const timeInput = screen.getByLabelText(/time of death/i) as HTMLInputElement;
      await user.type(timeInput, '10:30');

      await waitFor(() => {
        expect(getFormValues().deathTime).toBe('10:30');
      });
    });

    it('allows user to select AM/PM format', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderDateAndTimeOfDeathFieldWithFormik();

      // TimePickerSelect uses aria-label, find by that
      const formatSelect = screen.getByLabelText(/time format/i) as HTMLSelectElement;
      await user.selectOptions(formatSelect, 'PM');

      await waitFor(() => {
        expect(getFormValues().deathTimeFormat).toBe('PM');
      });
    });

    it('displays the initial time format value correctly', () => {
      renderDateAndTimeOfDeathFieldWithFormik({ deathTimeFormat: 'PM' });

      const formatSelect = screen.getByLabelText(/time format/i) as HTMLSelectElement;
      expect(formatSelect.value).toBe('PM');
    });
  });
});

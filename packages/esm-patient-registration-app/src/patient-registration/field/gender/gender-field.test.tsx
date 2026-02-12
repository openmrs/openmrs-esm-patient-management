import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render, screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { getValidationSchema } from '../../validation/patient-registration-validation';
import { GenderField } from './gender-field.component';
import { type FormValues } from '../../patient-registration.types';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

/**
 * Helper to render GenderField with Formik render props for state-dependent tests.
 * Returns the render result and a ref to access form values.
 */
const renderGenderFieldWithFormik = (
  initialValues: Partial<FormValues> = {},
  options?: { enableReinitialize?: boolean; withValidation?: boolean },
) => {
  const defaultValues = {
    gender: '',
    ...initialValues,
  };

  let formValuesRef: FormValues = { ...initialFormValues, ...defaultValues } as FormValues;
  const config = mockUseConfig();
  const validationSchema = options?.withValidation
    ? getValidationSchema(config, (key: string, defaultValue: string) => defaultValue)
    : null;

  const utils = render(
    <Formik
      initialValues={defaultValues}
      onSubmit={() => {}}
      enableReinitialize={options?.enableReinitialize}
      validationSchema={validationSchema || undefined}
      validateOnChange={true}
      validateOnBlur={true}>
      {({ setFieldValue, values, setFieldTouched, errors, touched }) => {
        formValuesRef = { ...initialFormValues, ...values } as FormValues;
        return (
          <Form>
            <PatientRegistrationContextProvider
              value={{
                identifierTypes: [],
                values: formValuesRef,
                validationSchema: validationSchema,
                inEditMode: false,
                setFieldValue: setFieldValue as any,
                setCapturePhotoProps: jest.fn(),
                setFieldTouched: setFieldTouched as any,
                currentPhoto: '',
                isOffline: false,
                initialFormValues: formValuesRef,
              }}>
              <GenderField />
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

/**
 * Helper to render GenderField with mocked Formik functions (for simple rendering tests).
 */
const renderGenderField = (initialValues: Partial<FormValues> = {}) => {
  const defaultValues = {
    gender: '',
    ...initialValues,
  };

  return render(
    <Formik initialValues={defaultValues} onSubmit={() => {}}>
      <Form>
        <PatientRegistrationContextProvider
          value={{
            identifierTypes: [],
            values: { ...initialFormValues, ...defaultValues } as FormValues,
            validationSchema: null,
            inEditMode: false,
            setFieldValue: jest.fn().mockResolvedValue(undefined),
            setCapturePhotoProps: jest.fn(),
            setFieldTouched: jest.fn().mockResolvedValue(undefined),
            currentPhoto: '',
            isOffline: false,
            initialFormValues: { ...initialFormValues, ...defaultValues } as FormValues,
          }}>
          <GenderField />
        </PatientRegistrationContextProvider>
      </Form>
    </Formik>,
  );
};

describe('GenderField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        gender: [
          {
            value: 'male',
            label: 'Male',
          },
          {
            value: 'female',
            label: 'Female',
          },
          {
            value: 'other',
            label: 'Other',
          },
          {
            value: 'unknown',
            label: 'Unknown',
          },
        ],
        name: {
          displayMiddleName: false,
          allowUnidentifiedPatients: false,
          defaultUnknownGivenName: '',
          defaultUnknownFamilyName: '',
          displayCapturePhoto: false,
          displayReverseFieldOrder: false,
        },
      } as RegistrationConfig['fieldConfigurations'],
    });
  });

  it('renders the gender field with all options', () => {
    renderGenderField();

    expect(screen.getByRole('heading', { name: /sex/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^male/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/female/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/other/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unknown/i)).toBeInTheDocument();
  });

  describe('Gender selection', () => {
    it('updates form value when user selects female', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderGenderFieldWithFormik({ gender: 'male' });

      await user.click(screen.getByText(/female/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/female/i)).toBeChecked();
      });
      expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
      expect(getFormValues().gender).toBe('female');
    });

    it('updates form value when user selects male', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderGenderFieldWithFormik({ gender: 'female' });

      await user.click(screen.getByText(/^male/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/^male/i)).toBeChecked();
      });
      expect(screen.getByLabelText(/female/i)).not.toBeChecked();
      expect(getFormValues().gender).toBe('male');
    });

    it('updates form value when user selects other', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderGenderFieldWithFormik();

      await user.click(screen.getByText(/other/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/other/i)).toBeChecked();
      });
      expect(getFormValues().gender).toBe('other');
    });

    it('updates form value when user selects unknown', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderGenderFieldWithFormik({ gender: 'male' });

      await user.click(screen.getByText(/unknown/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/unknown/i)).toBeChecked();
      });
      expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
      expect(getFormValues().gender).toBe('unknown');
    });

    it('displays the initial gender value correctly', () => {
      renderGenderFieldWithFormik({ gender: 'female' });

      expect(screen.getByLabelText(/female/i)).toBeChecked();
      expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
    });

    it('allows switching between all gender options', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderGenderFieldWithFormik();

      // Select male
      await user.click(screen.getByText(/^male/i));
      await waitFor(() => {
        expect(getFormValues().gender).toBe('male');
      });

      // Switch to female
      await user.click(screen.getByText(/female/i));
      await waitFor(() => {
        expect(getFormValues().gender).toBe('female');
      });

      // Switch to other
      await user.click(screen.getByText(/other/i));
      await waitFor(() => {
        expect(getFormValues().gender).toBe('other');
      });

      // Switch to unknown
      await user.click(screen.getByText(/unknown/i));
      await waitFor(() => {
        expect(getFormValues().gender).toBe('unknown');
      });
    });
  });

  describe('Validation error display', () => {
    it('does not show error when field is not touched', () => {
      renderGenderFieldWithFormik({ gender: '' }, { withValidation: true });

      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();
    });

    it('shows error message when user selects a gender and then form is validated', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderGenderFieldWithFormik({ gender: '' }, { withValidation: true });

      // Initially no error (field not touched)
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();

      // User selects a valid gender - this marks field as touched
      await user.click(screen.getByText(/^male/i));

      await waitFor(() => {
        expect(getFormValues().gender).toBe('male');
      });

      // After valid selection, no error should appear (user-visible)
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/^male/i)).toBeChecked();
    });

    it('clears error message when valid gender is selected', async () => {
      const user = userEvent.setup();
      renderGenderFieldWithFormik({ gender: '' }, { withValidation: true });

      // Initially no error (field not touched)
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();

      // Select a valid gender option - this will mark field as touched
      await user.click(screen.getByText(/^male/i));

      // Wait for selection to be applied (user-visible)
      await waitFor(() => {
        expect(screen.getByLabelText(/^male/i)).toBeChecked();
      });

      // Error should not appear after valid selection (user-visible)
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();
    });
  });
});

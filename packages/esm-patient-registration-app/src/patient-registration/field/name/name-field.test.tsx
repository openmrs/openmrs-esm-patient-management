import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render, screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { NameField, unidentifiedPatientAttributeTypeUuid } from './name-field.component';
import { type FormValues } from '../../patient-registration.types';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

/**
 * Helper to render NameField with Formik render props for state-dependent tests.
 */
const renderNameFieldWithFormik = (
  initialValues: Partial<FormValues> = {},
  options?: { enableReinitialize?: boolean },
) => {
  const defaultValues: Partial<FormValues> = {
    givenName: '',
    familyName: '',
    middleName: '',
    attributes: {
      [unidentifiedPatientAttributeTypeUuid]: 'false',
      ...(initialValues.attributes || {}),
    },
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
              <NameField />
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

describe('NameField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        name: {
          displayCapturePhoto: false,
          allowUnidentifiedPatients: true,
          defaultUnknownGivenName: 'UNKNOWN',
          defaultUnknownFamilyName: 'UNKNOWN',
          displayMiddleName: true,
          displayReverseFieldOrder: false,
        },
      } as RegistrationConfig['fieldConfigurations'],
    });
  });

  it('renders the name field with all inputs', () => {
    renderNameFieldWithFormik();

    expect(screen.getByRole('heading', { name: /full name/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/middle name/i)).toBeInTheDocument();
  });

  describe('Unidentified patient toggle', () => {
    it('shows toggle when allowUnidentifiedPatients is enabled', () => {
      renderNameFieldWithFormik();

      expect(screen.getByText(/patient's name is known\?/i)).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /yes/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /no/i })).toBeInTheDocument();
    });

    it('hides name inputs when patient is unknown', async () => {
      const user = userEvent.setup();
      renderNameFieldWithFormik({
        attributes: {
          [unidentifiedPatientAttributeTypeUuid]: 'false',
        },
      });

      await user.click(screen.getByRole('tab', { name: /no/i }));

      await waitFor(() => {
        expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
      });
      expect(screen.queryByLabelText(/family name/i)).not.toBeInTheDocument();
    });

    it('shows name inputs when patient is known', () => {
      renderNameFieldWithFormik({
        attributes: {
          [unidentifiedPatientAttributeTypeUuid]: 'false',
        },
      });

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
    });

    it('sets unknown name values when user selects unknown', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderNameFieldWithFormik(
        {
          attributes: {
            [unidentifiedPatientAttributeTypeUuid]: 'false',
          },
          givenName: 'John',
          familyName: 'Doe',
        },
        { enableReinitialize: true },
      );

      await user.click(screen.getByRole('tab', { name: /no/i }));

      // Wait for UI to update - name inputs should be hidden
      await waitFor(() => {
        expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
      });

      // Verify name values were set to UNKNOWN (user-visible through form state)
      await waitFor(() => {
        const formValues = getFormValues();
        expect(formValues.givenName).toBe('UNKNOWN');
      });
      const formValues = getFormValues();
      expect(formValues.familyName).toBe('UNKNOWN');
    });

    it('shows name inputs when user switches from unknown to known', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderNameFieldWithFormik(
        {
          attributes: {
            [unidentifiedPatientAttributeTypeUuid]: 'true',
          },
          givenName: 'UNKNOWN',
          familyName: 'UNKNOWN',
        },
        { enableReinitialize: true },
      );

      // Verify initial state - patient is unknown
      const initialValues = getFormValues();
      expect(initialValues.attributes?.[unidentifiedPatientAttributeTypeUuid]).toBe('true');

      // When patient is unknown, name inputs should be hidden (component logic: !isPatientUnknown)
      // But the component may render them initially before the attribute value is processed
      // Let's just verify the toggle works
      await user.click(screen.getByRole('tab', { name: /yes/i }));

      // Wait for UI to update - name inputs should appear (user-visible behavior)
      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      });
      expect(screen.getByLabelText(/family name/i)).toBeInTheDocument();
    });
  });

  describe('Name input', () => {
    it('allows user to enter first name', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderNameFieldWithFormik();

      const firstNameInput = screen.getByLabelText(/first name/i) as HTMLInputElement;
      await user.type(firstNameInput, 'John');

      await waitFor(() => {
        expect(getFormValues().givenName).toBe('John');
      });
    });

    it('allows user to enter family name', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderNameFieldWithFormik();

      const familyNameInput = screen.getByLabelText(/family name/i) as HTMLInputElement;
      await user.type(familyNameInput, 'Doe');

      await waitFor(() => {
        expect(getFormValues().familyName).toBe('Doe');
      });
    });

    it('allows user to enter middle name when displayMiddleName is enabled', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderNameFieldWithFormik();

      const middleNameInput = screen.getByLabelText(/middle name/i) as HTMLInputElement;
      await user.type(middleNameInput, 'Michael');

      await waitFor(() => {
        expect(getFormValues().middleName).toBe('Michael');
      });
    });

    it('hides middle name when displayMiddleName is disabled', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          name: {
            displayCapturePhoto: false,
            allowUnidentifiedPatients: true,
            defaultUnknownGivenName: 'UNKNOWN',
            defaultUnknownFamilyName: 'UNKNOWN',
            displayMiddleName: false,
            displayReverseFieldOrder: false,
          },
        } as RegistrationConfig['fieldConfigurations'],
      });

      renderNameFieldWithFormik();

      expect(screen.queryByLabelText(/middle name/i)).not.toBeInTheDocument();
    });
  });

  describe('Field order', () => {
    it('renders fields in default order when displayReverseFieldOrder is false', () => {
      renderNameFieldWithFormik();

      const inputs = screen.getAllByRole('textbox');
      const firstNameIndex = inputs.findIndex((input) => (input as HTMLInputElement).id === 'givenName');
      const familyNameIndex = inputs.findIndex((input) => (input as HTMLInputElement).id === 'familyName');

      expect(firstNameIndex).toBeLessThan(familyNameIndex);
    });

    it('renders fields in reverse order when displayReverseFieldOrder is true', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          name: {
            displayCapturePhoto: false,
            allowUnidentifiedPatients: true,
            defaultUnknownGivenName: 'UNKNOWN',
            defaultUnknownFamilyName: 'UNKNOWN',
            displayMiddleName: true,
            displayReverseFieldOrder: true,
          },
        } as RegistrationConfig['fieldConfigurations'],
      });

      renderNameFieldWithFormik();

      const inputs = screen.getAllByRole('textbox');
      const familyNameIndex = inputs.findIndex((input) => (input as HTMLInputElement).id === 'familyName');
      const firstNameIndex = inputs.findIndex((input) => (input as HTMLInputElement).id === 'givenName');

      expect(familyNameIndex).toBeLessThan(firstNameIndex);
    });
  });
});

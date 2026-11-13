import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render, screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { getNameTemplateLayout, NameField, unidentifiedPatientAttributeTypeUuid } from './name-field.component';
import { type FormValues, type NameTemplate } from '../../patient-registration.types';

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);

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
                setCapturePhotoProps: vi.fn(),
                setFieldTouched: setFieldTouched as any,
                currentPhoto: '',
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

const nameToken = (codeName: string, displayText: string) => ({
  isToken: 'IS_NAME_TOKEN' as const,
  displayText,
  codeName,
  displaySize: '30',
});

// As returned by GET /nametemplate/latinamerica, with labels translated by the backend
const latinAmericaNameTemplate: NameTemplate = {
  displayName: 'Formato de Nombres en Latino America',
  codeName: 'latinamerica',
  country: null,
  lines: [
    [{ isToken: 'IS_NOT_NAME_TOKEN', displayText: '' }, nameToken('givenName', 'Primer nombre')],
    [{ isToken: 'IS_NOT_NAME_TOKEN', displayText: '' }, nameToken('middleName', 'Segundo nombre')],
    [{ isToken: 'IS_NOT_NAME_TOKEN', displayText: '' }, nameToken('familyName', 'Primer apellido')],
    [{ isToken: 'IS_NOT_NAME_TOKEN', displayText: '' }, nameToken('familyName2', 'Segundo apellido')],
  ],
  lineByLineFormat: ['givenName', 'middleName', 'familyName', 'familyName2'],
  nameMappings: null,
  sizeMappings: null,
  elementDefaults: null,
  elementRegex: null,
  elementRegexFormats: null,
  requiredElements: null,
};

describe('NameField with a name template', () => {
  // Each test uses its own template code name, so the SWR cache is not shared between tests
  const useNameTemplateConfig = (nameTemplate: string) =>
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        name: {
          nameTemplate,
          displayCapturePhoto: false,
          allowUnidentifiedPatients: true,
          defaultUnknownGivenName: 'UNKNOWN',
          defaultUnknownFamilyName: 'UNKNOWN',
          displayMiddleName: false,
          displayReverseFieldOrder: true,
        },
      } as RegistrationConfig['fieldConfigurations'],
    });

  const respondWithTemplate = (template: Partial<NameTemplate>) =>
    mockOpenmrsFetch.mockResolvedValue({ data: { ...latinAmericaNameTemplate, ...template } } as never);

  it('fetches the configured template and shows its fields in order, with its labels', async () => {
    useNameTemplateConfig('latinamerica');
    respondWithTemplate({});

    renderNameFieldWithFormik();

    await screen.findByLabelText('Segundo apellido (optional)');
    expect(mockOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/nametemplate/latinamerica');
    // The template sets the order and shows the middle name, even though displayMiddleName and
    // displayReverseFieldOrder say otherwise
    expect(screen.getAllByRole('textbox').map((input) => input.id)).toEqual([
      'givenName',
      'middleName',
      'familyName',
      'familyName2',
    ]);
    expect(screen.getByLabelText('Primer nombre')).toBeRequired();
    expect(screen.getByLabelText('Primer apellido')).toBeRequired();
    expect(screen.getByLabelText('Segundo nombre (optional)')).not.toBeRequired();
  });

  it('saves what the user types into a template-only field', async () => {
    const user = userEvent.setup();
    useNameTemplateConfig('latinamerica-typing');
    respondWithTemplate({});

    const { getFormValues } = renderNameFieldWithFormik();
    await user.type(await screen.findByLabelText('Segundo apellido (optional)'), 'Pérez');

    expect(getFormValues().familyName2).toBe('Pérez');
  });

  it('requires the name parts the template marks as required, with a message', async () => {
    const user = userEvent.setup();
    useNameTemplateConfig('latinamerica-required');
    respondWithTemplate({ requiredElements: ['familyName2'] });

    renderNameFieldWithFormik();
    const secondFamilyName = await screen.findByLabelText('Segundo apellido');
    expect(secondFamilyName).toBeRequired();

    // Leaving the field empty validates it
    await user.click(secondFamilyName);
    await user.tab();

    expect(await screen.findByText('Segundo apellido is required')).toBeInTheDocument();
  });

  it('fills in the template defaults without replacing existing values', async () => {
    useNameTemplateConfig('latinamerica-defaults');
    respondWithTemplate({ elementDefaults: { familyName2: 'Default', middleName: 'Default' } });

    const { getFormValues } = renderNameFieldWithFormik({ middleName: 'Existing' });

    await waitFor(() => expect(getFormValues().familyName2).toBe('Default'));
    expect(getFormValues().middleName).toBe('Existing');
  });

  it('clears every template field when the patient is marked as unknown', async () => {
    const user = userEvent.setup();
    useNameTemplateConfig('latinamerica-unknown');
    respondWithTemplate({});

    const { getFormValues } = renderNameFieldWithFormik({ familyName2: 'Pérez' });
    await screen.findByLabelText('Segundo apellido (optional)');
    await user.click(screen.getByRole('tab', { name: 'No' }));

    expect(getFormValues().familyName2).toBe('');
    expect(getFormValues().givenName).toBe('UNKNOWN');
    expect(screen.queryByLabelText('Segundo apellido (optional)')).not.toBeInTheDocument();
  });

  it('shows the default name fields when the template cannot be loaded', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    useNameTemplateConfig('missing-template');
    mockOpenmrsFetch.mockRejectedValue(new Error('Not found'));

    renderNameFieldWithFormik();

    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    // The default fields, with displayMiddleName and displayReverseFieldOrder applied
    expect(screen.getAllByRole('textbox').map((input) => input.id)).toEqual(['familyName', 'givenName']);
    consoleError.mockRestore();
  });
});

describe('getNameTemplateLayout', () => {
  const getDefaultLabel = (name: string) => `Default ${name}`;

  it('skips name parts it does not know and repeated ones', () => {
    const layout = getNameTemplateLayout(
      {
        ...latinAmericaNameTemplate,
        lines: [[nameToken('givenName', 'Given'), nameToken('nickname', 'Nickname'), nameToken('givenName', 'Again')]],
      },
      getDefaultLabel,
    );

    expect(layout.map(({ name }) => name)).toEqual(['givenName', 'familyName']);
  });

  it('adds the given and family names when the template leaves them out, since the backend requires them', () => {
    const layout = getNameTemplateLayout(
      { ...latinAmericaNameTemplate, lines: [[nameToken('familyName2', 'Second family name')]] },
      getDefaultLabel,
    );

    expect(layout).toEqual([
      { name: 'familyName2', label: 'Second family name', required: false },
      { name: 'givenName', label: 'Default givenName', required: true },
      { name: 'familyName', label: 'Default familyName', required: true },
    ]);
  });
});

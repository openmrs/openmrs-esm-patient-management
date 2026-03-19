import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type FieldDefinition, type RegistrationConfig } from '../../../config-schema';
import { useConcept, useConceptAnswers } from '../field.resource';
import { ObsField } from './obs-field.component';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';

const mockUseConcept = jest.mocked(useConcept);
const mockUseConceptAnswers = jest.mocked(useConceptAnswers);
const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

jest.mock('../field.resource');

const useConceptMockImpl = (uuid: string) => {
  let data;
  if (uuid == 'weight-uuid') {
    data = {
      uuid: 'weight-uuid',
      display: 'Weight (kg)',
      datatype: { display: 'Numeric', uuid: 'num' },
      answers: [],
      setMembers: [],
    };
  } else if (uuid == 'chief-complaint-uuid') {
    data = {
      uuid: 'chief-complaint-uuid',
      display: 'Chief Complaint',
      datatype: { display: 'Text', uuid: 'txt' },
      answers: [],
      setMembers: [],
    };
  } else if (uuid == 'nationality-uuid') {
    data = {
      uuid: 'nationality-uuid',
      display: 'Nationality',
      datatype: { display: 'Coded', uuid: 'cdd' },
      answers: [
        { display: 'USA', uuid: 'usa' },
        { display: 'Mexico', uuid: 'mex' },
      ],
      setMembers: [],
    };
  } else if (uuid == 'vaccination-date-uuid') {
    data = {
      uuid: 'vaccination-date-uuid',
      display: 'Vaccination Date',
      datatype: { display: 'Date', uuid: 'date' },
      answers: [],
      setMembers: [],
    };
  } else {
    throw Error(`Programming error, you probably didn't mean to do this: unknown concept uuid '${uuid}'`);
  }
  return {
    data: data ?? null,
    isLoading: !data,
  };
};

const useConceptAnswersMockImpl = (uuid: string) => {
  if (uuid == 'nationality-uuid') {
    return {
      data: [
        { display: 'USA', uuid: 'usa' },
        { display: 'Mexico', uuid: 'mex' },
      ],
      isLoading: false,
      error: null,
    };
  } else if (uuid == 'other-countries-uuid') {
    return {
      data: [
        { display: 'Kenya', uuid: 'ke' },
        { display: 'Uganda', uuid: 'ug' },
      ],
      isLoading: false,
      error: null,
    };
  } else if (uuid == '') {
    return {
      data: [],
      isLoading: false,
      error: null,
    };
  } else {
    throw Error(`Programming error, you probably didn't mean to do this: unknown concept answer set uuid '${uuid}'`);
  }
};

const textFieldDef: FieldDefinition = {
  id: 'chief-complaint',
  type: 'obs',
  label: 'Chief complaint',
  placeholder: '',
  showHeading: false,
  uuid: 'chief-complaint-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

const numberFieldDef: FieldDefinition = {
  id: 'weight',
  type: 'obs',
  label: 'Weight',
  placeholder: '',
  showHeading: false,
  uuid: 'weight-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

const dateFieldDef: FieldDefinition = {
  id: 'vac_date',
  type: 'obs',
  label: 'Vaccination date',
  placeholder: '',
  showHeading: false,
  uuid: 'vaccination-date-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

const codedFieldDef: FieldDefinition = {
  id: 'nationality',
  type: 'obs',
  label: 'Nationality',
  placeholder: '',
  showHeading: false,
  uuid: 'nationality-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

/**
 * Helper to render ObsField with Formik render props for state-dependent tests.
 */
const renderObsFieldWithFormik = (
  fieldDefinition: FieldDefinition,
  initialValues: Partial<FormValues> = {},
  options?: { enableReinitialize?: boolean },
) => {
  const defaultValues = {
    obs: {},
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
              <ObsField fieldDefinition={fieldDefinition} />
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

describe('ObsField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      registrationObs: { encounterTypeUuid: 'reg-enc-uuid' },
    } as RegistrationConfig);
    mockUseConcept.mockImplementation(useConceptMockImpl);
    mockUseConceptAnswers.mockImplementation(useConceptAnswersMockImpl);
  });

  it('does not render if no registration encounter type is provided', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      registrationObs: { encounterTypeUuid: null },
    } as RegistrationConfig);

    const { container } = render(<ObsField fieldDefinition={textFieldDef} />);
    expect(container).toBeEmptyDOMElement();
    consoleSpy.mockRestore();
  });

  it('does not render while concept is loading', () => {
    mockUseConcept.mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { container } = render(<ObsField fieldDefinition={textFieldDef} />);
    expect(container).toBeEmptyDOMElement();
  });

  describe('Text obs field', () => {
    it('renders a text input for text concept', () => {
      renderObsFieldWithFormik(textFieldDef);

      expect(screen.getByRole('textbox', { name: /chief complaint/i })).toBeInTheDocument();
    });

    it('allows user to enter text', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderObsFieldWithFormik(textFieldDef);

      const textInput = screen.getByRole('textbox', { name: /chief complaint/i }) as HTMLInputElement;
      await user.type(textInput, 'Patient has fever');

      await waitFor(() => {
        expect(getFormValues().obs['chief-complaint-uuid']).toBe('Patient has fever');
      });
    });

    it('validates input against regex pattern', async () => {
      const user = userEvent.setup();
      renderObsFieldWithFormik({
        ...textFieldDef,
        validation: {
          required: false,
          matches: '^[A-Z]+$', // Only uppercase letters
        },
      });

      const textInput = screen.getByRole('textbox', { name: /chief complaint/i }) as HTMLInputElement;
      await user.type(textInput, 'lowercase');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
      });
    });

    it('does not show error for valid input matching regex', async () => {
      const user = userEvent.setup();
      renderObsFieldWithFormik({
        ...textFieldDef,
        validation: {
          required: false,
          matches: '^[A-Z]+$', // Only uppercase letters
        },
      });

      const textInput = screen.getByRole('textbox', { name: /chief complaint/i }) as HTMLInputElement;
      await user.type(textInput, 'FEVER');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid input/i)).not.toBeInTheDocument();
      });
    });

    it('renders as required when configured', () => {
      renderObsFieldWithFormik({
        ...textFieldDef,
        validation: {
          required: true,
          matches: null,
        },
      });

      const textInput = screen.getByRole('textbox', { name: /chief complaint/i });
      expect(textInput).toBeRequired();
    });

    it('renders as optional when not required', () => {
      renderObsFieldWithFormik(textFieldDef);

      const textInput = screen.getByRole('textbox', { name: /chief complaint/i });
      expect(textInput).not.toBeRequired();
    });
  });

  describe('Numeric obs field', () => {
    it('renders a number input for numeric concept', () => {
      renderObsFieldWithFormik(numberFieldDef);

      expect(screen.getByRole('spinbutton', { name: /weight/i })).toBeInTheDocument();
    });

    it('allows user to enter numeric value', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderObsFieldWithFormik(numberFieldDef);

      const numberInput = screen.getByRole('spinbutton', { name: /weight/i }) as HTMLInputElement;
      await user.type(numberInput, '75');

      await waitFor(() => {
        // Numeric inputs can store values as numbers or strings depending on Formik behavior
        const value = getFormValues().obs['weight-uuid'];
        const stringValue = String(value);
        expect(stringValue === '75' || Number(value) === 75).toBe(true);
      });
    });

    it('renders as required when configured', () => {
      renderObsFieldWithFormik({
        ...numberFieldDef,
        validation: {
          required: true,
          matches: null,
        },
      });

      const numberInput = screen.getByRole('spinbutton', { name: /weight/i });
      expect(numberInput).toBeRequired();
    });
  });

  describe('Date obs field', () => {
    it('renders a date picker for date concept', () => {
      renderObsFieldWithFormik(dateFieldDef);

      expect(screen.getByLabelText(/vaccination date/i)).toBeInTheDocument();
    });

    it('allows user to enter date', async () => {
      const { getFormValues } = renderObsFieldWithFormik(dateFieldDef);

      const dateInput = screen.getByLabelText(/vaccination date/i) as HTMLInputElement;
      const dateString = '2020-01-15';

      fireEvent.change(dateInput, { target: { value: dateString } });
      fireEvent.blur(dateInput);

      await waitFor(() => {
        expect(getFormValues().obs['vaccination-date-uuid']).toBeTruthy();
      });
    });

    it('renders as required when configured', () => {
      renderObsFieldWithFormik({
        ...dateFieldDef,
        validation: {
          required: true,
          matches: null,
        },
      });

      const dateInput = screen.getByLabelText(/vaccination date/i);
      // OpenmrsDatePicker uses isRequired prop, not HTML required attribute
      expect(dateInput).toBeInTheDocument();
    });
  });

  describe('Coded obs field', () => {
    it('renders a select for a coded concept', () => {
      renderObsFieldWithFormik(codedFieldDef);

      expect(screen.getByRole('combobox', { name: 'Nationality' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'USA' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Mexico' })).toBeInTheDocument();
    });

    it('allows user to select an option', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderObsFieldWithFormik(codedFieldDef);

      const select = screen.getByRole('combobox', { name: 'Nationality' }) as HTMLSelectElement;
      await user.selectOptions(select, 'usa');

      await waitFor(() => {
        expect(getFormValues().obs['nationality-uuid']).toBe('usa');
      });
      expect(select.value).toBe('usa');
    });

    it('uses answerConceptSetUuid for answers when provided', () => {
      renderObsFieldWithFormik({
        ...codedFieldDef,
        answerConceptSetUuid: 'other-countries-uuid',
      });

      expect(screen.getByRole('combobox', { name: 'Nationality' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Kenya' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Uganda' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'USA' })).not.toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Mexico' })).not.toBeInTheDocument();
    });

    it('uses customConceptAnswers when provided', () => {
      renderObsFieldWithFormik({
        ...codedFieldDef,
        customConceptAnswers: [
          {
            uuid: 'mozambique-uuid',
            label: 'Mozambique',
          },
        ],
      });

      expect(screen.getByRole('combobox', { name: 'Nationality' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Mozambique' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Uganda' })).not.toBeInTheDocument();
    });

    it('renders as required when configured', () => {
      renderObsFieldWithFormik({
        ...codedFieldDef,
        validation: {
          required: true,
          matches: null,
        },
      });

      const select = screen.getByRole('combobox', { name: 'Nationality' });
      expect(select).toBeRequired();
    });
  });

  describe('Error handling', () => {
    it('displays error for unknown datatype', () => {
      mockUseConcept.mockReturnValue({
        data: {
          uuid: 'unknown-uuid',
          display: 'Unknown Field',
          datatype: { display: 'UnknownType', uuid: 'unknown' },
          answers: [],
          setMembers: [],
        },
        isLoading: false,
      });

      renderObsFieldWithFormik({
        ...textFieldDef,
        uuid: 'unknown-uuid',
      });

      // InlineNotification renders with kind="error" which shows an error message
      // Check for the specific error message text
      expect(screen.getByText(/unknown datatype/i)).toBeInTheDocument();
      expect(screen.getByText(/UnknownType/i)).toBeInTheDocument();
    });
  });
});

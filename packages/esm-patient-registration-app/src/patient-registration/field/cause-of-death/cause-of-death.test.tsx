import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render, screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { useConceptAnswers } from '../field.resource';
import { CauseOfDeathField } from './cause-of-death.component';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);
const mockUseConceptAnswers = jest.mocked(useConceptAnswers);

jest.mock('../field.resource', () => ({
  ...jest.requireActual('../field.resource'),
  useConceptAnswers: jest.fn(),
}));

const mockConceptAnswers = [
  { display: 'Cardiac Arrest', uuid: 'cardiac-uuid' },
  { display: 'Pneumonia', uuid: 'pneumonia-uuid' },
  { display: 'Other', uuid: 'other-uuid' },
];

/**
 * Helper to render CauseOfDeathField with Formik render props for state-dependent tests.
 */
const renderCauseOfDeathFieldWithFormik = (
  initialValues: Partial<FormValues> = {},
  options?: { enableReinitialize?: boolean },
) => {
  const defaultValues = {
    deathCause: '',
    nonCodedCauseOfDeath: '',
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
              <CauseOfDeathField />
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

describe('CauseOfDeathField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        causeOfDeath: {
          conceptUuid: 'cause-of-death-uuid',
          required: false,
        },
      } as RegistrationConfig['fieldConfigurations'],
      freeTextFieldConceptUuid: 'other-uuid',
    } as RegistrationConfig);
    mockUseConceptAnswers.mockReturnValue({
      data: mockConceptAnswers,
      isLoading: false,
      error: null,
    });
  });

  it('renders the cause of death field with label', () => {
    renderCauseOfDeathFieldWithFormik();

    expect(screen.getByRole('heading', { name: /cause of death/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /cause of death/i })).toBeInTheDocument();
  });

  it('displays loading skeleton when concept answers are loading', () => {
    mockUseConceptAnswers.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderCauseOfDeathFieldWithFormik();

    // SelectSkeleton renders as a skeleton element, check for the skeleton class
    expect(screen.getByText(/cause of death/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('displays error notification when concept UUID is not configured', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        causeOfDeath: {
          conceptUuid: null,
          required: false,
        },
      } as RegistrationConfig['fieldConfigurations'],
    });

    renderCauseOfDeathFieldWithFormik();

    expect(screen.getByText(/error fetching coded causes of death/i)).toBeInTheDocument();
  });

  it('displays error notification when there is an error loading concept answers', () => {
    mockUseConceptAnswers.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    renderCauseOfDeathFieldWithFormik();

    expect(screen.getByText(/error fetching coded causes of death/i)).toBeInTheDocument();
  });

  describe('Cause of death selection', () => {
    it('renders all available cause of death options', () => {
      renderCauseOfDeathFieldWithFormik();

      expect(screen.getByRole('option', { name: /cardiac arrest/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /pneumonia/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /other/i })).toBeInTheDocument();
    });

    it('updates form value when user selects a cause of death', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderCauseOfDeathFieldWithFormik();

      const select = screen.getByRole('combobox', { name: /cause of death/i }) as HTMLSelectElement;
      await user.selectOptions(select, 'cardiac-uuid');

      await waitFor(() => {
        expect(getFormValues().deathCause).toBe('cardiac-uuid');
      });
      expect(select.value).toBe('cardiac-uuid');
    });

    it('shows non-coded cause of death input when "Other" is selected', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderCauseOfDeathFieldWithFormik();

      const select = screen.getByRole('combobox', { name: /cause of death/i }) as HTMLSelectElement;
      await user.selectOptions(select, 'other-uuid');

      await waitFor(() => {
        expect(getFormValues().deathCause).toBe('other-uuid');
      });

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /non-coded cause of death/i })).toBeInTheDocument();
      });
    });

    it('hides non-coded cause of death input when non-other option is selected', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderCauseOfDeathFieldWithFormik(
        { deathCause: 'other-uuid' },
        { enableReinitialize: true },
      );

      // Wait for non-coded input to appear (component checks deathCause.value)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /non-coded cause of death/i })).toBeInTheDocument();
      });

      // Select a different option
      const select = screen.getByRole('combobox', { name: /cause of death/i }) as HTMLSelectElement;
      await user.selectOptions(select, 'cardiac-uuid');

      await waitFor(() => {
        expect(getFormValues().deathCause).toBe('cardiac-uuid');
      });

      // Non-coded input should be hidden
      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: /non-coded cause of death/i })).not.toBeInTheDocument();
      });
    });

    it('allows user to enter non-coded cause of death text', async () => {
      const user = userEvent.setup();
      const { getFormValues } = renderCauseOfDeathFieldWithFormik(
        { deathCause: 'other-uuid' },
        { enableReinitialize: true },
      );

      // Wait for non-coded input to appear
      const textInput = await screen.findByRole('textbox', { name: /non-coded cause of death/i });
      await user.type(textInput, 'Unknown cause');

      await waitFor(() => {
        expect(getFormValues().nonCodedCauseOfDeath).toBe('Unknown cause');
      });
    });
  });

  describe('Required field', () => {
    it('renders as required when configured', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          causeOfDeath: {
            conceptUuid: 'cause-of-death-uuid',
            required: true,
          },
        } as RegistrationConfig['fieldConfigurations'],
        freeTextFieldConceptUuid: 'other-uuid',
      } as RegistrationConfig);

      renderCauseOfDeathFieldWithFormik();

      const select = screen.getByRole('combobox', { name: /cause of death/i });
      expect(select).toBeRequired();
    });

    it('renders as optional when not required', () => {
      renderCauseOfDeathFieldWithFormik();

      const select = screen.getByRole('combobox', { name: /cause of death/i });
      expect(select).not.toBeRequired();
    });
  });
});

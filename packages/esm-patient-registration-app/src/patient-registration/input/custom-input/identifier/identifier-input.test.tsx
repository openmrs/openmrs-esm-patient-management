import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { getDefaultsFromConfigSchema, useConfig, UserHasAccess } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../../../../config-schema';
import { renderWithContext } from 'tools';
import { ResourcesContextProvider } from '../../../../resources-context';
import { type Resources } from '../../../../registration.resource';
import {
  PatientRegistrationContextProvider,
  type PatientRegistrationContextProps,
} from '../../../patient-registration-context';
import type {
  AddressTemplate,
  FormValues,
  IdentifierSource,
  PatientIdentifierValue,
} from '../../../patient-registration.types';
import IdentifierInput, { promoteFallbackPreferredIdentifier } from './identifier-input.component';

const mockIdentifierTypes = [
  {
    fieldName: 'openMrsId',
    format: '',
    identifierSources: [
      {
        uuid: '01af8526-cea4-4175-aa90-340acb411771',
        name: 'Generator 2 for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: true,
          automaticGenerationEnabled: true,
        },
      },
    ],
    isPrimary: true,
    name: 'OpenMRS ID',
    required: true,
    uniquenessBehavior: 'UNIQUE' as const,
    uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
  },
  {
    fieldName: 'ssn',
    format: '^[A-Z]{1}-[0-9]{7}$',
    formatDescription: 'Identifier should be one letter, followed by a dash, and then 7 digits e.g. A-1234567',
    identifierSources: [
      {
        uuid: '01af8526-cea4-4175-aa90-340acb411771',
        name: 'Generator 2 for SSN',
        autoGenerationOption: {
          manualEntryEnabled: true,
          automaticGenerationEnabled: false,
        },
      },
    ],
    isPrimary: false,
    name: 'SSN',
    required: true,
    uniquenessBehavior: 'UNIQUE' as const,
    uuid: 'a71403f3-8584-4289-ab41-2b4e5570bd45',
  },
];

const mockResourcesContextValue: Resources = {
  addressTemplate: {} as AddressTemplate,
  currentSession: {
    authenticated: true,
    sessionId: 'JSESSION',
    currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
  },
  relationshipTypes: { results: [] },
  identifierTypes: [...mockIdentifierTypes],
};

const mockInitialFormValues = {
  additionalFamilyName: '',
  additionalGivenName: '',
  additionalMiddleName: '',
  addNameInLocalLanguage: false,
  address: {},
  attributes: {},
  birthdate: null,
  deathDate: null,
  familyName: '',
  gender: '',
  givenName: '',
  identifiers: {},
  middleName: '',
  relationships: [],
} as FormValues;

const mockContextValues: PatientRegistrationContextProps = {
  currentPhoto: '',
  inEditMode: false,
  identifierTypes: [],
  initialFormValues: mockInitialFormValues,
  setCapturePhotoProps: vi.fn(),
  setFieldValue: vi.fn(),
  setInitialFormValues: vi.fn(),
  setFieldTouched: vi.fn(),
  validationSchema: null,
  values: mockInitialFormValues,
};

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);
const mockUserHasAccess = vi.mocked(UserHasAccess);

/**
 * Helper to render IdentifierInput component with Formik.
 */
function renderIdentifierInput(
  patientIdentifier: PatientIdentifierValue,
  fieldName: string = 'openMrsId',
  initialValues: Record<string, any> = {},
  contextValues: Partial<PatientRegistrationContextProps> = {},
) {
  return renderWithContext(
    <Formik initialValues={initialValues} onSubmit={vi.fn()}>
      <Form>
        <PatientRegistrationContextProvider value={{ ...mockContextValues, ...contextValues }}>
          <IdentifierInput patientIdentifier={patientIdentifier} fieldName={fieldName} />
        </PatientRegistrationContextProvider>
      </Form>
    </Formik>,
    ResourcesContextProvider,
    mockResourcesContextValue,
  );
}

describe('IdentifierInput component', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
    });
  });

  const fieldName = 'openMrsId';
  const openmrsID = {
    identifierTypeUuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
    initialValue: '',
    identifierName: 'OpenMRS ID',
    selectedSource: {
      uuid: '01af8526-cea4-4175-aa90-340acb411771',
      name: 'Generator 2 for OpenMRS ID',
      autoGenerationOption: {
        manualEntryEnabled: false,
        automaticGenerationEnabled: true,
      },
    } as IdentifierSource,
    autoGeneration: false,
    preferred: true,
    required: true,
  } as PatientIdentifierValue;

  describe('Rendering', () => {
    it('shows the identifier input', () => {
      renderIdentifierInput({ ...openmrsID, autoGeneration: false });
      expect(screen.getByLabelText(openmrsID.identifierName)).toBeInTheDocument();
    });

    it('displays an edit button when there is an initial value and field is not required', () => {
      renderIdentifierInput({
        ...openmrsID,
        autoGeneration: false,
        required: false,
        initialValue: '1002UU9',
        identifierValue: '1002UU9',
      });
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('hides the edit button when the identifier is required', () => {
      renderIdentifierInput({
        ...openmrsID,
        autoGeneration: false,
        required: true,
        initialValue: '1002UU9',
        identifierValue: '1002UU9',
      });
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    });

    it('displays a delete button when the identifier is not a default type', () => {
      renderIdentifierInput({
        ...openmrsID,
        required: false,
      });
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Preferred identifier', () => {
    const enablePreferredSelection = () => {
      const defaults = getDefaultsFromConfigSchema<RegistrationConfig>(esmPatientRegistrationSchema);
      mockUseConfig.mockReturnValue({
        ...defaults,
        fieldConfigurations: {
          ...defaults.fieldConfigurations,
          identifier: { allowPreferredSelection: true },
        },
      });
    };

    it('does not show the preferred option by default', () => {
      renderIdentifierInput(openmrsID);
      expect(screen.queryByRole('radio', { name: /preferred/i })).not.toBeInTheDocument();
    });

    it('shows the preferred option checked for the preferred identifier when enabled', () => {
      enablePreferredSelection();
      renderIdentifierInput(openmrsID);
      expect(screen.getByRole('radio', { name: /preferred/i })).toBeChecked();
    });

    describe('label of an optional identifier', () => {
      const ssn = { ...openmrsID, identifierName: 'SSN', required: false, autoGeneration: false };

      it('does not mark the preferred identifier as optional', () => {
        enablePreferredSelection();
        renderIdentifierInput({ ...ssn, preferred: true }, 'ssn');
        expect(screen.getByLabelText('SSN')).toBeInTheDocument();
        expect(screen.queryByLabelText(/SSN \(optional\)/)).not.toBeInTheDocument();
      });

      it('marks an identifier that is not preferred as optional', () => {
        enablePreferredSelection();
        renderIdentifierInput({ ...ssn, preferred: false }, 'ssn');
        expect(screen.getByLabelText(/SSN \(optional\)/)).toBeInTheDocument();
      });

      it('marks the preferred identifier as optional when preferred selection is disabled', () => {
        renderIdentifierInput({ ...ssn, preferred: true }, 'ssn');
        expect(screen.getByLabelText(/SSN \(optional\)/)).toBeInTheDocument();
      });
    });

    describe('without the Edit Patient Identifiers privilege', () => {
      beforeEach(() => {
        mockUserHasAccess.mockImplementation(({ privilege, fallback, children }) =>
          privilege === 'Edit Patient Identifiers' ? <>{fallback}</> : <>{children}</>,
        );
      });

      afterEach(() => {
        mockUserHasAccess.mockImplementation(({ children }) => <>{children}</>);
      });

      it('shows a read-only preferred option when editing an existing patient', async () => {
        const user = userEvent.setup();
        const setFieldValue = vi.fn();
        enablePreferredSelection();
        renderIdentifierInput({ ...openmrsID, preferred: false }, 'openMrsId', {}, { inEditMode: true, setFieldValue });

        const radio = screen.getByRole('radio', { name: /preferred/i });
        expect(radio).toBeDisabled();
        expect(radio).not.toBeChecked();

        await user.click(radio);
        expect(setFieldValue).not.toHaveBeenCalled();
      });

      it('shows which identifier is preferred in the read-only option', () => {
        enablePreferredSelection();
        renderIdentifierInput(openmrsID, 'openMrsId', {}, { inEditMode: true });
        const radio = screen.getByRole('radio', { name: /preferred/i });
        expect(radio).toBeDisabled();
        expect(radio).toBeChecked();
      });

      it('shows an enabled preferred option when registering a new patient', () => {
        enablePreferredSelection();
        renderIdentifierInput(openmrsID, 'openMrsId', {}, { inEditMode: false });
        expect(screen.getByRole('radio', { name: /preferred/i })).toBeEnabled();
      });
    });

    it('shows an enabled preferred option when editing with the Edit Patient Identifiers privilege', () => {
      enablePreferredSelection();
      renderIdentifierInput(openmrsID, 'openMrsId', {}, { inEditMode: true });
      expect(screen.getByRole('radio', { name: /preferred/i })).toBeEnabled();
    });

    it('marks the selected identifier as the only preferred identifier', async () => {
      const user = userEvent.setup();
      const setFieldValue = vi.fn();
      const setFieldTouched = vi.fn();
      const ssn = { ...openmrsID, identifierName: 'SSN', preferred: false };
      enablePreferredSelection();
      renderIdentifierInput(
        ssn,
        'ssn',
        {},
        {
          setFieldValue,
          setFieldTouched,
          values: { ...mockInitialFormValues, identifiers: { openMrsId: openmrsID, ssn } },
        },
      );

      await user.click(screen.getByRole('radio', { name: /preferred/i }));

      expect(setFieldValue).toHaveBeenCalledWith('identifiers', {
        openMrsId: { ...openmrsID, preferred: false },
        ssn: { ...ssn, preferred: true },
      });
      // Marking the value as touched shows the missing-value error without waiting for blur or submit
      expect(setFieldTouched).toHaveBeenCalledWith('identifiers.ssn.identifierValue', true, false);
    });
  });

  describe('Deleting the preferred identifier', () => {
    const ssnTypeUuid = 'a71403f3-8584-4289-ab41-2b4e5570bd45';
    const optionalIdentifier = (identifierTypeUuid: string, identifierValue: string, preferred = false) =>
      ({
        ...openmrsID,
        identifierTypeUuid,
        identifierValue,
        autoGeneration: false,
        required: false,
        preferred,
      }) as PatientIdentifierValue;

    it('promotes the primary identifier type', () => {
      const result = promoteFallbackPreferredIdentifier(
        {
          ssn: optionalIdentifier(ssnTypeUuid, 'A-1234567'),
          openMrsId: optionalIdentifier(openmrsID.identifierTypeUuid, ''),
        },
        mockIdentifierTypes,
        {},
      );
      expect(result.openMrsId.preferred).toBe(true);
      expect(result.ssn.preferred).toBe(false);
    });

    it('promotes the identifier that was preferred when the form was loaded', () => {
      const result = promoteFallbackPreferredIdentifier(
        { first: optionalIdentifier('type-1', '111'), second: optionalIdentifier('type-2', '222') },
        [],
        { second: optionalIdentifier('type-2', '222', true) },
      );
      expect(result.first.preferred).toBe(false);
      expect(result.second.preferred).toBe(true);
    });

    it('promotes the first identifier that has a value', () => {
      const result = promoteFallbackPreferredIdentifier(
        { empty: optionalIdentifier('type-1', ''), filled: optionalIdentifier('type-2', '222') },
        [],
        {},
      );
      expect(result.empty.preferred).toBe(false);
      expect(result.filled.preferred).toBe(true);
    });

    it('leaves the identifiers unchanged when one is still preferred', () => {
      const identifiers = {
        first: optionalIdentifier('type-1', '111', true),
        second: optionalIdentifier('type-2', '222'),
      };
      expect(promoteFallbackPreferredIdentifier(identifiers, mockIdentifierTypes, {})).toBe(identifiers);
    });

    it('marks a remaining identifier as preferred when the preferred row is deleted', async () => {
      const user = userEvent.setup();
      const setFieldValue = vi.fn();
      const defaults = getDefaultsFromConfigSchema<RegistrationConfig>(esmPatientRegistrationSchema);
      mockUseConfig.mockReturnValue({
        ...defaults,
        fieldConfigurations: { ...defaults.fieldConfigurations, identifier: { allowPreferredSelection: true } },
      });
      const other = optionalIdentifier('type-1', '111');
      const deleted = optionalIdentifier('type-2', '222', true);
      renderIdentifierInput(
        deleted,
        'deleted',
        {},
        {
          setFieldValue,
          values: { ...mockInitialFormValues, identifiers: { other, deleted } },
        },
      );

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(setFieldValue).toHaveBeenCalledWith('identifiers', { other: { ...other, preferred: true } });
    });
  });

  describe('Auto-generated identifier', () => {
    it('hides the input when the identifier is auto-generated', () => {
      renderIdentifierInput({
        ...openmrsID,
        autoGeneration: true,
      });
      expect(screen.getByTestId('identifier-input')).toHaveAttribute('type', 'hidden');
    });

    it("displays 'Auto-Generated' when the identifier has auto generation", () => {
      renderIdentifierInput({
        ...openmrsID,
        autoGeneration: true,
      });
      const placeholder = screen.getByTestId('identifier-placeholder');
      expect(placeholder).toHaveTextContent('Auto-generated');
      expect(screen.getByTestId('identifier-input')).toBeDisabled();
    });

    describe('Manual entry allowed', () => {
      it('shows the edit button when manual entry is enabled', () => {
        renderIdentifierInput({
          ...openmrsID,
          autoGeneration: true,
          required: false,
          selectedSource: {
            uuid: '01af8526-cea4-4175-aa90-340acb411771',
            name: 'Generator 2 for OpenMRS ID',
            autoGenerationOption: {
              manualEntryEnabled: true,
              automaticGenerationEnabled: true,
            },
          } as IdentifierSource,
        });
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      describe('Edit button interaction', () => {
        it('displays an empty input field when edit button is clicked', async () => {
          const user = userEvent.setup();
          renderIdentifierInput(
            {
              ...openmrsID,
              autoGeneration: true,
              required: false,
              selectedSource: {
                ...openmrsID.selectedSource,
                autoGenerationOption: {
                  manualEntryEnabled: true,
                  automaticGenerationEnabled: true,
                },
              } as IdentifierSource,
            },
            fieldName,
          );

          const editButton = screen.getByTestId('edit-button');
          await user.click(editButton);

          await waitFor(() => {
            expect(screen.getByLabelText(new RegExp(`${openmrsID.identifierName}`))).toHaveValue('');
          });
        });

        it('displays an input field with the identifier value if it exists', async () => {
          const user = userEvent.setup();
          renderIdentifierInput(
            {
              ...openmrsID,
              autoGeneration: true,
              required: false,
              selectedSource: {
                ...openmrsID.selectedSource,
                autoGenerationOption: {
                  manualEntryEnabled: true,
                  automaticGenerationEnabled: true,
                },
              } as IdentifierSource,
            },
            fieldName,
            { identifiers: { [fieldName]: { identifierValue: '10001V' } } },
          );

          const editButton = screen.getByTestId('edit-button');
          await user.click(editButton);

          await waitFor(() => {
            expect(screen.getByLabelText(new RegExp(`${openmrsID.identifierName}`))).toHaveValue('10001V');
          });
        });
      });
    });
  });

  describe('Format validation', () => {
    it('validates identifier format correctly for identifier types with regex formats', async () => {
      const user = userEvent.setup();

      const ssnIdentifier = {
        ...openmrsID,
        autoGeneration: false,
        format: '^[A-Z]{1}-[0-9]{7}$',
        identifierName: 'SSN',
        identifierTypeUuid: 'a71403f3-8584-4289-ab41-2b4e5570bd45',
        identifierValue: undefined,
        initialValue: '',
        required: true,
        selectedSource: {
          uuid: '01af8526-cea4-4175-aa90-340acb411771',
          name: 'Generator 2 for SSN',
          autoGenerationOption: {
            manualEntryEnabled: true,
            automaticGenerationEnabled: false,
          },
        } as IdentifierSource,
      };

      const mockSetFieldTouched = vi.fn();
      const mockSetFieldValue = vi.fn();
      const testContextValues = {
        ...mockContextValues,
        setFieldTouched: mockSetFieldTouched,
        setFieldValue: mockSetFieldValue,
        values: {
          ...mockInitialFormValues,
          identifiers: {
            [fieldName]: ssnIdentifier,
          },
        },
      };

      const initialValues = {
        identifiers: {
          [fieldName]: {
            identifierValue: '',
          },
        },
      };

      renderWithContext(
        <Formik initialValues={initialValues} onSubmit={vi.fn()}>
          <Form>
            <PatientRegistrationContextProvider value={testContextValues}>
              <IdentifierInput patientIdentifier={ssnIdentifier} fieldName={fieldName} />
            </PatientRegistrationContextProvider>
          </Form>
        </Formik>,
        ResourcesContextProvider,
        mockResourcesContextValue,
      );

      const input = screen.getByRole('textbox', {
        name: /ssn/i,
      });

      // Valid case
      await user.type(input, 'A-1234567');
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveValue('A-1234567');
      });

      await waitFor(() => {
        expect(input).not.toHaveClass('cds--text-input--invalid');
      });

      expect(screen.queryByText(/identifier should be/i)).not.toBeInTheDocument();

      // Invalid cases
      await user.clear(input);
      await user.type(input, 'A-0010902aaa'); // Extra characters
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveClass('cds--text-input--invalid');
      });

      await waitFor(() => {
        expect(screen.getByText(/identifier should be/i)).toBeInTheDocument();
      });

      await user.clear(input);
      await user.type(input, 'a-1234567'); // Lowercase letter
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveClass('cds--text-input--invalid');
      });

      await user.clear(input);
      await user.type(input, 'AB-1234567'); // Two letters
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveClass('cds--text-input--invalid');
      });

      await user.clear(input);
      await user.type(input, 'A-123456'); // Only 6 digits
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveClass('cds--text-input--invalid');
      });
    });
  });
});

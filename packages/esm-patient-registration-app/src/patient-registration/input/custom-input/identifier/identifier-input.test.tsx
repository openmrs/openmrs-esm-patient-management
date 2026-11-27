import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, screen, waitFor } from '@testing-library/react';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import { getDefaultsFromConfigSchema, useConfig, userHasAccess, UserHasAccess } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../../../../config-schema';
import { ResourcesContextProvider } from '../../../../resources-context';
import { createPatternRuleRegistry, PatternRulesProvider } from '../../../validation/pattern-rules';
import { useFormHelpers } from '../../../form-adapter';
import { renderWithRegistrationForm } from '../../../../test-utils/render-with-registration-form';
import IdentifierInput, { promoteFallbackPreferredIdentifier } from './identifier-input.component';
import type { Resources } from '../../../../registration.resource';
import type * as RegistrationResolver from '../../../registration-resolver';
import type { PatientRegistrationContextProps } from '../../../patient-registration-context';
import type {
  AddressTemplate,
  FormValues,
  IdentifierSource,
  PatientIdentifierValue,
} from '../../../patient-registration.types';

const resolverCalls = vi.hoisted(() => ({ count: 0 }));

// Counts the validations of the form, so a test can show that a write did not validate again.
vi.mock('../../../registration-resolver', async (importOriginal) => {
  const actual = await importOriginal<typeof RegistrationResolver>();
  return {
    ...actual,
    createRegistrationResolver: (...args: Parameters<typeof actual.createRegistrationResolver>) => {
      const resolve = actual.createRegistrationResolver(...args);
      return (...resolverArgs: Parameters<typeof resolve>) => {
        resolverCalls.count++;
        return resolve(...resolverArgs);
      };
    },
  };
});

const validationConfig = {
  freeTextFieldConceptUuid: 'free-text-uuid',
  fieldConfigurations: {
    gender: [{ label: 'M', value: 'male' }],
    identifier: { allowPreferredSelection: false },
  },
} as unknown as RegistrationConfig;

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

const mockContextValues = {
  currentPhoto: '',
  inEditMode: false,
  identifierTypes: [],
  initialFormValues: mockInitialFormValues,
  setCapturePhotoProps: vi.fn(),
  setInitialFormValues: vi.fn(),
} as Partial<PatientRegistrationContextProps>;

let formHelpers: ReturnType<typeof useFormHelpers>;
let form: UseFormReturn<FormValues>;

/** Gives the tests the form, to write other fields and to read errors. */
const FormProbe: React.FC = () => {
  formHelpers = useFormHelpers();
  form = useFormContext<FormValues>();
  return null;
};

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);
const mockUserHasAccess = vi.mocked(UserHasAccess);
const mockUserHasAccessCheck = vi.mocked(userHasAccess);

/**
 * Helper to render IdentifierInput component in a registration form.
 */
function renderIdentifierInput(
  patientIdentifier: PatientIdentifierValue,
  fieldName: string = 'openMrsId',
  initialValues: Record<string, any> = {},
  contextValues: Partial<PatientRegistrationContextProps> = {},
  resources: Resources = mockResourcesContextValue,
) {
  return renderWithRegistrationForm(
    <ResourcesContextProvider value={resources}>
      <IdentifierInput patientIdentifier={patientIdentifier} fieldName={fieldName} />
    </ResourcesContextProvider>,
    { initialValues, contextValues: { ...mockContextValues, ...contextValues } },
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

  describe('Pattern rule', () => {
    it('registers the format rule only while the input is visible', async () => {
      const user = userEvent.setup();
      const registry = createPatternRuleRegistry();
      const ssn = {
        identifierTypeUuid: 'a71403f3-8584-4289-ab41-2b4e5570bd45',
        initialValue: 'A-1',
        identifierValue: 'A-1',
        identifierName: 'SSN',
        autoGeneration: false,
        preferred: false,
        required: true,
      } as PatientIdentifierValue;

      renderWithRegistrationForm(
        <ResourcesContextProvider value={mockResourcesContextValue}>
          <PatternRulesProvider registry={registry}>
            <IdentifierInput patientIdentifier={ssn} fieldName="ssn" />
          </PatternRulesProvider>
        </ResourcesContextProvider>,
        { contextValues: mockContextValues },
      );

      expect(registry.getRules()).toEqual([]);

      await user.click(screen.getByTestId('edit-button'));

      expect(registry.getRules()).toEqual([
        {
          path: 'identifiers.ssn.identifierValue',
          pattern: '^[A-Z]{1}-[0-9]{7}$',
          message: 'Identifier should be one letter, followed by a dash, and then 7 digits e.g. A-1234567',
          onInvalidPattern: 'pass',
        },
      ]);
    });
  });

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
        const identifier = { ...openmrsID, preferred: false };
        enablePreferredSelection();
        const { getValues } = renderIdentifierInput(
          identifier,
          'openMrsId',
          { identifiers: { openMrsId: identifier } },
          { inEditMode: true },
        );

        const radio = screen.getByRole('radio', { name: /preferred/i });
        expect(radio).toBeDisabled();
        expect(radio).not.toBeChecked();

        await user.click(radio);
        expect(getValues().identifiers).toEqual({ openMrsId: identifier });
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
      const ssn = { ...openmrsID, identifierName: 'SSN', preferred: false };
      enablePreferredSelection();
      const { getValues, getTouched } = renderWithRegistrationForm(
        <ResourcesContextProvider value={mockResourcesContextValue}>
          <IdentifierInput patientIdentifier={ssn} fieldName="ssn" />
        </ResourcesContextProvider>,
        {
          initialValues: { ...mockInitialFormValues, identifiers: { openMrsId: openmrsID, ssn } },
          contextValues: mockContextValues,
          withValidation: true,
        },
      );
      const validationsBefore = resolverCalls.count;

      await user.click(screen.getByRole('radio', { name: /preferred/i }));

      expect(getValues().identifiers).toEqual({
        openMrsId: { ...openmrsID, preferred: false },
        ssn: { ...ssn, preferred: true },
      });
      // Marking the value as touched shows the missing-value error without waiting for blur or submit
      expect(getTouched().identifiers.ssn.identifierValue).toBe(true);
      expect(await screen.findByText('Identifier value is required')).toBeInTheDocument();
      // Only the new identifiers are validated: marking the value as touched does not validate again
      await waitFor(() => expect(resolverCalls.count).toBe(validationsBefore + 1));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
      expect(resolverCalls.count).toBe(validationsBefore + 1);
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

    it.each`
      inEditMode | canEditIdentifiers | promotesFallback
      ${false}   | ${false}           | ${true}
      ${true}    | ${true}            | ${true}
      ${true}    | ${false}           | ${false}
    `(
      'when the preferred row is deleted (edit mode: $inEditMode, can edit identifiers: $canEditIdentifiers), promotes a fallback: $promotesFallback',
      async ({ inEditMode, canEditIdentifiers, promotesFallback }) => {
        const user = userEvent.setup();
        const defaults = getDefaultsFromConfigSchema<RegistrationConfig>(esmPatientRegistrationSchema);
        mockUseConfig.mockReturnValue({
          ...defaults,
          fieldConfigurations: { ...defaults.fieldConfigurations, identifier: { allowPreferredSelection: true } },
        });
        mockUserHasAccessCheck.mockReturnValue(canEditIdentifiers);
        const other = optionalIdentifier('type-1', '111');
        const deleted = optionalIdentifier('type-2', '222', true);
        const { getValues } = renderIdentifierInput(
          deleted,
          'deleted',
          { identifiers: { other, deleted } },
          { inEditMode },
        );

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        // Without promotion, the backend picks the new preferred identifier when the deleted one is purged
        expect(getValues().identifiers).toEqual({ other: { ...other, preferred: promotesFallback } });
        expect(mockUserHasAccessCheck).toHaveBeenCalledWith('Edit Patient Identifiers', undefined);
      },
    );
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

      describe('required identifier', () => {
        const manualEntrySource = {
          ...openmrsID.selectedSource,
          autoGenerationOption: { manualEntryEnabled: true, automaticGenerationEnabled: true },
        } as IdentifierSource;
        const savedIdentifier = {
          ...openmrsID,
          required: true,
          autoGeneration: false,
          selectedSource: null,
          initialValue: '1002UU9',
          identifierValue: '1002UU9',
        } as PatientIdentifierValue;

        it('shows the edit button for a new identifier', () => {
          renderIdentifierInput({
            ...openmrsID,
            required: true,
            autoGeneration: true,
            selectedSource: manualEntrySource,
          });
          expect(screen.getByTestId('edit-button')).toBeInTheDocument();
        });

        it('does not mark the input as natively required for a new identifier, as an empty value is generated', async () => {
          const user = userEvent.setup();
          renderIdentifierInput({
            ...openmrsID,
            required: true,
            autoGeneration: true,
            selectedSource: manualEntrySource,
          });

          await user.click(screen.getByTestId('edit-button'));

          expect(await screen.findByRole('textbox', { name: openmrsID.identifierName })).not.toBeRequired();
        });

        it('shows the edit button for a saved identifier when editing a patient', () => {
          renderIdentifierInput(savedIdentifier, fieldName, {}, { inEditMode: true });
          expect(screen.getByTestId('edit-button')).toBeInTheDocument();
        });

        it("hides the edit button for a saved identifier when the identifier type's source does not allow manual entry", () => {
          renderIdentifierInput(
            savedIdentifier,
            fieldName,
            {},
            { inEditMode: true },
            {
              ...mockResourcesContextValue,
              identifierTypes: mockIdentifierTypes.map((type) =>
                type.fieldName === fieldName
                  ? {
                      ...type,
                      identifierSources: type.identifierSources.map((source) => ({
                        ...source,
                        autoGenerationOption: { ...source.autoGenerationOption, manualEntryEnabled: false },
                      })),
                    }
                  : type,
              ),
            },
          );
          expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
        });
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
          const identifier = {
            ...openmrsID,
            autoGeneration: true,
            required: false,
            initialValue: '10001V',
            identifierValue: '10001V',
            selectedSource: {
              ...openmrsID.selectedSource,
              autoGenerationOption: {
                manualEntryEnabled: true,
                automaticGenerationEnabled: true,
              },
            } as IdentifierSource,
          };
          renderIdentifierInput(identifier, fieldName, { identifiers: { [fieldName]: identifier } });

          const editButton = screen.getByTestId('edit-button');
          await user.click(editButton);

          await waitFor(() => {
            expect(screen.getByLabelText(new RegExp(`${openmrsID.identifierName}`))).toHaveValue('10001V');
          });
        });

        it('keeps the selected source when the identifier type has more than one source', async () => {
          const user = userEvent.setup();
          const automaticOnlySource = {
            uuid: 'automatic-only-source-uuid',
            name: 'Automatic only',
            autoGenerationOption: { manualEntryEnabled: false, automaticGenerationEnabled: true },
          } as IdentifierSource;
          const manualEntrySource = {
            uuid: 'manual-entry-source-uuid',
            name: 'Manual entry',
            autoGenerationOption: { manualEntryEnabled: true, automaticGenerationEnabled: true },
          } as IdentifierSource;

          const identifier = { ...openmrsID, autoGeneration: true, selectedSource: manualEntrySource };
          const { getValues } = renderIdentifierInput(
            identifier,
            fieldName,
            { identifiers: { [fieldName]: identifier } },
            {},
            {
              ...mockResourcesContextValue,
              identifierTypes: mockIdentifierTypes.map((type) =>
                type.fieldName === fieldName
                  ? { ...type, identifierSources: [automaticOnlySource, manualEntrySource] }
                  : type,
              ),
            },
          );

          await user.click(screen.getByTestId('edit-button'));

          expect(getValues().identifiers[fieldName]).toEqual(
            expect.objectContaining({ selectedSource: manualEntrySource, autoGeneration: true, identifierValue: '' }),
          );
        });
      });
    });
  });

  describe('Error display', () => {
    it('shows the error of a hidden identifier only after its value is touched', async () => {
      const name = `identifiers.${fieldName}.identifierValue`;
      // Hidden because its value is the saved value; required, so the empty value is an error
      const identifier = {
        ...openmrsID,
        autoGeneration: false,
        required: true,
        initialValue: '',
        identifierValue: '',
      } as PatientIdentifierValue;

      renderWithRegistrationForm(
        <ResourcesContextProvider value={mockResourcesContextValue}>
          <FormProbe />
          <IdentifierInput patientIdentifier={identifier} fieldName={fieldName} />
        </ResourcesContextProvider>,
        {
          initialValues: { ...mockInitialFormValues, identifiers: { [fieldName]: identifier } },
          contextValues: mockContextValues,
          withValidation: true,
          config: validationConfig,
        },
      );
      expect(screen.getByTestId('identifier-input')).toHaveAttribute('type', 'hidden');

      // A change to another field validates the whole form
      act(() => formHelpers.setFieldValue('givenName', 'Jane'));
      await waitFor(() => expect(form.getFieldState(name).error?.message).toBe('Identifier value is required'));
      expect(screen.queryByText('Identifier value is required')).not.toBeInTheDocument();

      act(() => formHelpers.setFieldTouched(name, true));

      expect(await screen.findByText('Identifier value is required')).toBeInTheDocument();
    });

    it('shows the format error of a visible identifier only after blur', async () => {
      const user = userEvent.setup();
      const name = 'identifiers.ssn.identifierValue';
      const formatError = 'Identifier should be one letter, followed by a dash, and then 7 digits e.g. A-1234567';
      const ssn = {
        identifierTypeUuid: 'a71403f3-8584-4289-ab41-2b4e5570bd45',
        identifierName: 'SSN',
        initialValue: '',
        identifierValue: 'A-12',
        autoGeneration: false,
        preferred: false,
        required: false,
      } as PatientIdentifierValue;

      renderWithRegistrationForm(
        <ResourcesContextProvider value={mockResourcesContextValue}>
          <FormProbe />
          <IdentifierInput patientIdentifier={ssn} fieldName="ssn" />
        </ResourcesContextProvider>,
        {
          initialValues: { ...mockInitialFormValues, identifiers: { ssn } },
          contextValues: mockContextValues,
          withValidation: true,
          config: validationConfig,
        },
      );
      const input = screen.getByRole('textbox', { name: /ssn/i });

      // A change to another field validates the whole form, with the format rule of the visible input
      act(() => formHelpers.setFieldValue('givenName', 'Jane'));
      await waitFor(() => expect(form.getFieldState(name).error?.message).toBe(formatError));
      expect(input).not.toHaveClass('cds--text-input--invalid');
      expect(screen.queryByText(formatError)).not.toBeInTheDocument();

      await user.click(input);
      await user.tab();

      await waitFor(() => expect(input).toHaveClass('cds--text-input--invalid'));
      expect(screen.getByText(formatError)).toBeInTheDocument();
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

      const initialValues = {
        identifiers: {
          [fieldName]: {
            identifierValue: '',
          },
        },
      };

      renderWithRegistrationForm(
        <ResourcesContextProvider value={mockResourcesContextValue}>
          <IdentifierInput patientIdentifier={ssnIdentifier} fieldName={fieldName} />
        </ResourcesContextProvider>,
        {
          initialValues: initialValues as Partial<FormValues>,
          contextValues: mockContextValues,
          withValidation: true,
          config: validationConfig,
        },
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

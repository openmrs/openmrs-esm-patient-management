import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../../../../config-schema';
import { renderWithContext } from 'tools';
import { ResourcesContextProvider } from '../../../../resources-context';
import { type Resources } from '../../../../offline.resources';
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
import IdentifierInput from './identifier-input.component';

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
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldValue: jest.fn(),
  setInitialFormValues: jest.fn(),
  setFieldTouched: jest.fn(),
  validationSchema: null,
  values: mockInitialFormValues,
};

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

/**
 * Helper to render IdentifierInput component with Formik.
 */
function renderIdentifierInput(
  patientIdentifier: PatientIdentifierValue,
  fieldName: string = 'openMrsId',
  initialValues: Record<string, any> = {},
) {
  return renderWithContext(
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
      <Form>
        <PatientRegistrationContextProvider value={mockContextValues}>
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

      const mockSetFieldTouched = jest.fn();
      const mockSetFieldValue = jest.fn();
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
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
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

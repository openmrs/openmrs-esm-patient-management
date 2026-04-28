import React from 'react';
import { Form, Formik } from 'formik';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig, useLayoutType, isDesktop } from '@openmrs/esm-framework';
import { mockPatient, mockSession } from '__mocks__';
import { renderWithContext } from 'tools';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../../../config-schema';
import {
  PatientRegistrationContextProvider,
  type PatientRegistrationContextProps,
} from '../../patient-registration-context';
import { ResourcesContextProvider } from '../../../resources-context';
import PatientIdentifierOverlay from './identifier-selection-overlay.component';
import type { AddressTemplate, FormValues, PatientIdentifierType } from '../../patient-registration.types';
import type { Resources } from '../../../offline.resources';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockIsDesktop = jest.mocked(isDesktop);

// Mock identifier types
const mockIdentifierTypes: PatientIdentifierType[] = [
  {
    uuid: 'openmrs-id-uuid',
    name: 'OpenMRS ID',
    fieldName: 'openMrsId',
    format: '^[0-9]{5,6}$',
    formatDescription: 'Format: 5-6 digits',
    required: true,
    isPrimary: true,
    uniquenessBehavior: 'UNIQUE',
    identifierSources: [
      {
        uuid: 'source-1-uuid',
        name: 'Auto-generated',
        autoGenerationOption: {
          automaticGenerationEnabled: true,
          manualEntryEnabled: false,
        },
      },
    ],
  },
  {
    uuid: 'passport-id-uuid',
    name: 'Passport Number',
    fieldName: 'passportId',
    format: '',
    required: false,
    isPrimary: false,
    uniquenessBehavior: 'NON_UNIQUE',
    identifierSources: [
      {
        uuid: 'source-2-uuid',
        name: 'Manual Entry',
        autoGenerationOption: {
          automaticGenerationEnabled: false,
          manualEntryEnabled: true,
        },
      },
    ],
  },
  {
    uuid: 'national-id-uuid',
    name: 'National ID',
    fieldName: 'nationalId',
    format: '',
    required: false,
    isPrimary: false,
    uniquenessBehavior: 'NON_UNIQUE',
    identifierSources: [],
  },
];

const mockResourcesContextValue: Resources = {
  addressTemplate: {} as AddressTemplate,
  currentSession: mockSession.data,
  identifierTypes: mockIdentifierTypes,
  relationshipTypes: { results: [] },
} as Resources;

const mockInitialFormValues: FormValues = {
  additionalFamilyName: '',
  additionalGivenName: '',
  additionalMiddleName: '',
  addNameInLocalLanguage: false,
  address: {},
  birthdate: null,
  birthdateEstimated: false,
  deathCause: '',
  deathDate: '',
  deathTime: '',
  deathTimeFormat: 'AM' as 'AM' | 'PM',
  nonCodedCauseOfDeath: '',
  familyName: 'Doe',
  gender: 'male',
  givenName: 'John',
  identifiers: {},
  isDead: false,
  middleName: 'Test',
  monthsEstimated: 0,
  patientUuid: mockPatient.uuid,
  relationships: [],
  telephoneNumber: '',
  yearsEstimated: 0,
};

const mockContextValues: PatientRegistrationContextProps = {
  currentPhoto: null,
  inEditMode: false,
  identifierTypes: [],
  initialFormValues: mockInitialFormValues,
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldValue: jest.fn(),
  setInitialFormValues: jest.fn(),
  validationSchema: null,
  values: mockInitialFormValues,
} as unknown as PatientRegistrationContextProps;

/**
 * Helper to render PatientIdentifierOverlay with Formik.
 */
function renderIdentifierSelectionOverlay(
  contextValues: PatientRegistrationContextProps = mockContextValues,
  resourcesContextValue: Resources = mockResourcesContextValue,
) {
  const mockSetFieldValue = jest.fn();
  const mockCloseOverlay = jest.fn();

  const utils = renderWithContext(
    <Formik initialValues={{}} onSubmit={() => {}}>
      <Form>
        <PatientRegistrationContextProvider value={contextValues}>
          <PatientIdentifierOverlay setFieldValue={mockSetFieldValue} closeOverlay={mockCloseOverlay} />
        </PatientRegistrationContextProvider>
      </Form>
    </Formik>,
    ResourcesContextProvider,
    resourcesContextValue,
  );

  return {
    ...utils,
    mockSetFieldValue,
    mockCloseOverlay,
  };
}

describe('PatientIdentifierOverlay component', () => {
  beforeEach(() => {
    mockIsDesktop.mockReturnValue(true);
    mockUseLayoutType.mockReturnValue('desktop' as any);
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      defaultPatientIdentifierTypes: [],
    });
  });

  describe('Rendering', () => {
    it('renders overlay with header', () => {
      renderIdentifierSelectionOverlay();

      // Header text appears in the overlay header (may appear in both header and button)
      const headers = screen.queryAllByText(/configure identifiers/i);
      expect(headers.length).toBeGreaterThan(0);
    });

    it('renders instruction text', () => {
      renderIdentifierSelectionOverlay();

      expect(screen.getByText(/select the identifiers you'd like to add for this patient/i)).toBeInTheDocument();
    });

    it('renders all identifier types as checkboxes', () => {
      renderIdentifierSelectionOverlay();

      expect(screen.getByLabelText('OpenMRS ID')).toBeInTheDocument();
      expect(screen.getByLabelText('Passport Number')).toBeInTheDocument();
      expect(screen.getByLabelText('National ID')).toBeInTheDocument();
    });

    it('renders search input when there are more than 7 identifier types', () => {
      const manyIdentifierTypes = Array.from({ length: 8 }, (_, i) => ({
        ...mockIdentifierTypes[0],
        uuid: `uuid-${i}`,
        name: `Identifier ${i}`,
        fieldName: `identifier${i}`,
        required: false,
        isPrimary: false,
      }));

      renderIdentifierSelectionOverlay(mockContextValues, {
        ...mockResourcesContextValue,
        identifierTypes: manyIdentifierTypes,
      });

      // Search input has both labelText and placeholder with same text, so use getAllByLabelText
      expect(screen.getAllByLabelText(/search identifier/i).length).toBeGreaterThan(0);
    });

    it('does not render search input when there are 7 or fewer identifier types', () => {
      renderIdentifierSelectionOverlay();

      expect(screen.queryByRole('searchbox', { name: /search identifier/i })).not.toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('allows selecting an identifier type', async () => {
      const user = userEvent.setup();
      const { mockSetFieldValue } = renderIdentifierSelectionOverlay();

      const passportCheckbox = screen.getByLabelText('Passport Number');
      await user.click(passportCheckbox);

      expect(passportCheckbox).toBeChecked();
    });

    it('allows deselecting an identifier type', async () => {
      const user = userEvent.setup();
      renderIdentifierSelectionOverlay();

      const passportCheckbox = screen.getByLabelText('Passport Number');
      await user.click(passportCheckbox);
      expect(passportCheckbox).toBeChecked();

      await user.click(passportCheckbox);
      expect(passportCheckbox).not.toBeChecked();
    });

    it('displays identifier source options when identifier is selected and has sources', async () => {
      const user = userEvent.setup();
      renderIdentifierSelectionOverlay();

      const passportCheckbox = screen.getByLabelText('Passport Number');
      await user.click(passportCheckbox);

      await waitFor(() => {
        expect(screen.getByText(/source/i)).toBeInTheDocument();
      });
      expect(screen.getByLabelText('Manual Entry')).toBeInTheDocument();
    });

    it('allows selecting identifier source', async () => {
      const user = userEvent.setup();
      renderIdentifierSelectionOverlay();

      const passportCheckbox = screen.getByLabelText('Passport Number');
      await user.click(passportCheckbox);

      await waitFor(() => {
        const sourceRadio = screen.getByLabelText('Manual Entry');
        expect(sourceRadio).toBeInTheDocument();
      });

      const sourceRadio = screen.getByLabelText('Manual Entry');
      await user.click(sourceRadio);

      expect(sourceRadio).toBeChecked();
    });

    it('filters identifier types when searching', async () => {
      const user = userEvent.setup();
      const manyIdentifierTypes = Array.from({ length: 8 }, (_, i) => {
        if (i < 3) {
          return mockIdentifierTypes[i];
        }
        return {
          ...mockIdentifierTypes[0],
          uuid: `test-uuid-${i}`,
          name: `Test Identifier ${i}`,
          fieldName: `testId${i}`,
          required: false,
          isPrimary: false,
        };
      });

      renderIdentifierSelectionOverlay(mockContextValues, {
        ...mockResourcesContextValue,
        identifierTypes: manyIdentifierTypes,
      });

      // Search input has both labelText and placeholder with same text, get the first one
      const searchInputs = screen.getAllByLabelText(/search identifier/i);
      const searchInput = searchInputs[0];
      await user.type(searchInput, 'Passport');

      expect(screen.getByLabelText('Passport Number')).toBeInTheDocument();
      expect(screen.queryByLabelText('Test Identifier 3')).not.toBeInTheDocument();
    });

    it('calls setFieldValue and closeOverlay when Configure button is clicked', async () => {
      const user = userEvent.setup();
      const { mockSetFieldValue, mockCloseOverlay } = renderIdentifierSelectionOverlay();

      const passportCheckbox = screen.getByLabelText('Passport Number');
      await user.click(passportCheckbox);

      const configureButton = screen.getByRole('button', { name: /configure identifiers/i });
      await user.click(configureButton);

      expect(mockSetFieldValue).toHaveBeenCalledWith('identifiers', expect.any(Object));
      expect(mockCloseOverlay).toHaveBeenCalledTimes(1);
    });

    it('calls closeOverlay when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const { mockCloseOverlay } = renderIdentifierSelectionOverlay();

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockCloseOverlay).toHaveBeenCalledTimes(1);
    });
  });

  describe('Disabled states', () => {
    it('disables primary identifier type checkbox', () => {
      renderIdentifierSelectionOverlay();

      const openmrsIdCheckbox = screen.getByLabelText('OpenMRS ID');
      expect(openmrsIdCheckbox).toBeDisabled();
    });

    it('disables required identifier type checkbox', () => {
      renderIdentifierSelectionOverlay();

      const openmrsIdCheckbox = screen.getByLabelText('OpenMRS ID');
      expect(openmrsIdCheckbox).toBeDisabled();
    });

    it('disables identifier type that is in defaultPatientIdentifierTypes', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        defaultPatientIdentifierTypes: ['passport-id-uuid'],
      });

      renderIdentifierSelectionOverlay();

      const passportCheckbox = screen.getByLabelText('Passport Number');
      expect(passportCheckbox).toBeDisabled();
    });
  });
});

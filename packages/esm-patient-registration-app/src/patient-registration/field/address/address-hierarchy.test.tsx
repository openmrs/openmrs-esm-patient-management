import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockedAddressTemplate, mockedOrderedFields, mockOpenmrsId, mockPatient, mockSession } from '__mocks__';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { useOrderedAddressHierarchyLevels } from './address-hierarchy.resource';
import { ResourcesContextProvider } from '../../../resources-context';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import { AddressComponent } from './address-field.component';
import type { AddressTemplate } from '../../patient-registration.types';
import type { Resources } from '../../../registration.resource';
import type { PatientRegistrationContextProps } from '../../patient-registration-context';

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);
const mockUseOrderedAddressHierarchyLevels = vi.mocked(useOrderedAddressHierarchyLevels);

const mockResourcesContextValue = {
  addressTemplate: {} as AddressTemplate,
  currentSession: mockSession.data,
  identifierTypes: [],
  relationshipTypes: { results: [] },
} as Resources;

const mockInitialFormValues = {
  additionalFamilyName: '',
  additionalGivenName: '',
  additionalMiddleName: '',
  addNameInLocalLanguage: false,
  address: {},
  birthdate: '',
  birthdateEstimated: false,
  deathCause: '',
  deathDate: '',
  deathTime: '',
  deathTimeFormat: 'AM' as 'AM' | 'PM',
  nonCodedCauseOfDeath: '',
  familyName: 'Doe',
  gender: 'male',
  givenName: 'John',
  identifiers: mockOpenmrsId,
  isDead: false,
  middleName: 'Test',
  monthsEstimated: 0,
  patientUuid: mockPatient.uuid,
  relationships: [],
  telephoneNumber: '',
  yearsEstimated: 0,
};

const initialContextValues: Partial<PatientRegistrationContextProps> = {
  currentPhoto: '',
  inEditMode: false,
  identifierTypes: [],
  initialFormValues: mockInitialFormValues,
  setCapturePhotoProps: vi.fn(),
  setFieldTouched: vi.fn(),
  setInitialFormValues: vi.fn(),
  values: mockInitialFormValues,
};

vi.mock('./address-hierarchy.resource', async () => ({
  ...((await vi.importActual('./address-hierarchy.resource')) as object),
  useOrderedAddressHierarchyLevels: vi.fn(),
}));

/**
 * Helper to render AddressComponent in a registration form.
 */
async function renderAddressHierarchy(
  contextValues: Partial<PatientRegistrationContextProps>,
  resourcesContextValue: Resources = mockResourcesContextValue,
) {
  return await renderWithRegistrationForm(
    <ResourcesContextProvider value={resourcesContextValue}>
      <AddressComponent />
    </ResourcesContextProvider>,
    { initialValues: mockInitialFormValues, contextValues },
  );
}

describe('Address hierarchy', () => {
  beforeEach(() => {
    mockResourcesContextValue.addressTemplate = {} as AddressTemplate;
  });

  describe('Loading states', () => {
    it('renders a loading skeleton when the address template is not available', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          address: {
            useAddressHierarchy: {
              enabled: false,
              useQuickSearch: false,
              searchAddressByLevel: false,
            },
          },
        } as RegistrationConfig['fieldConfigurations'],
        fieldDefinitions: [],
      });

      mockUseOrderedAddressHierarchyLevels.mockReturnValue({
        orderedFields: [],
        isLoadingFieldOrder: false,
        errorFetchingFieldOrder: undefined,
      });

      renderAddressHierarchy(initialContextValues);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders a loading skeleton when address hierarchy order levels are loading', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          address: {
            useAddressHierarchy: {
              enabled: true,
              useQuickSearch: false,
              searchAddressByLevel: false,
            },
          },
        } as RegistrationConfig['fieldConfigurations'],
        fieldDefinitions: [],
      });

      mockUseOrderedAddressHierarchyLevels.mockReturnValue({
        orderedFields: [],
        isLoadingFieldOrder: true,
        errorFetchingFieldOrder: undefined,
      });

      renderAddressHierarchy(initialContextValues);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Rendering', () => {
    beforeEach(() => {
      mockResourcesContextValue.addressTemplate = mockedAddressTemplate;
    });

    it('renders address fields when address hierarchy is disabled', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          address: {
            useAddressHierarchy: {
              enabled: false,
              useQuickSearch: false,
              searchAddressByLevel: false,
            },
          },
        } as RegistrationConfig['fieldConfigurations'],
        fieldDefinitions: [],
      });

      mockUseOrderedAddressHierarchyLevels.mockReturnValue({
        orderedFields: [],
        isLoadingFieldOrder: false,
        errorFetchingFieldOrder: undefined,
      });

      renderAddressHierarchy(initialContextValues);

      const allFields = mockedAddressTemplate.lines.flat().filter(({ isToken }) => isToken === 'IS_ADDR_TOKEN');
      allFields.forEach((field) => {
        const textFieldInput = screen.getByLabelText(`${field.displayText} (optional)`);
        expect(textFieldInput).toBeInTheDocument();
      });
    });

    it('renders address hierarchy fields in order when address hierarchy is enabled', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          address: {
            useAddressHierarchy: {
              enabled: true,
              useQuickSearch: false,
              searchAddressByLevel: false,
            },
          },
        } as RegistrationConfig['fieldConfigurations'],
        fieldDefinitions: [],
      });

      mockUseOrderedAddressHierarchyLevels.mockReturnValue({
        orderedFields: mockedOrderedFields,
        isLoadingFieldOrder: false,
        errorFetchingFieldOrder: undefined,
      });

      renderAddressHierarchy(initialContextValues);

      const allFields = mockedAddressTemplate.lines.flat().filter(({ isToken }) => isToken === 'IS_ADDR_TOKEN');
      const orderMap = Object.fromEntries(mockedOrderedFields.map((field, indx) => [field, indx]));
      allFields.sort(
        (existingField1, existingField2) =>
          orderMap[existingField1.codeName ?? 0] - orderMap[existingField2.codeName ?? 0],
      );
      allFields.forEach((field) => {
        const textFieldInput = screen.getByLabelText(`${field.displayText} (optional)`);
        expect(textFieldInput).toBeInTheDocument();
      });
    });

    it('renders quick search bar when useQuickSearch is enabled', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          address: {
            useAddressHierarchy: {
              enabled: true,
              useQuickSearch: true,
              searchAddressByLevel: false,
            },
          },
        } as RegistrationConfig['fieldConfigurations'],
        fieldDefinitions: [],
      });

      mockUseOrderedAddressHierarchyLevels.mockReturnValue({
        orderedFields: mockedOrderedFields,
        isLoadingFieldOrder: false,
        errorFetchingFieldOrder: undefined,
      });

      renderAddressHierarchy(initialContextValues);

      const searchbox = screen.getByRole('searchbox', { name: /search address/i });
      expect(searchbox).toBeInTheDocument();
    });

    it('renders address fields when searchAddressByLevel is enabled', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          address: {
            useAddressHierarchy: {
              enabled: true,
              useQuickSearch: false,
              searchAddressByLevel: true,
            },
          },
        } as RegistrationConfig['fieldConfigurations'],
        fieldDefinitions: [],
      });

      mockUseOrderedAddressHierarchyLevels.mockReturnValue({
        orderedFields: mockedOrderedFields,
        isLoadingFieldOrder: false,
        errorFetchingFieldOrder: undefined,
      });

      renderAddressHierarchy(initialContextValues);

      const allFields = mockedAddressTemplate.lines.flat().filter(({ isToken }) => isToken === 'IS_ADDR_TOKEN');
      const orderMap = Object.fromEntries(mockedOrderedFields.map((field, indx) => [field, indx]));
      allFields.sort(
        (existingField1, existingField2) =>
          orderMap[existingField1.codeName ?? 0] - orderMap[existingField2.codeName ?? 0],
      );
      allFields.forEach((field) => {
        const textFieldInput = screen.getByLabelText(`${field.displayText} (optional)`);
        expect(textFieldInput).toBeInTheDocument();
      });
    });
  });

  describe('Element defaults', () => {
    it('writes the address template element defaults to the address values of the form', () => {
      mockResourcesContextValue.addressTemplate = mockedAddressTemplate;
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          address: {
            useAddressHierarchy: { enabled: false, useQuickSearch: false, searchAddressByLevel: false },
          },
        } as RegistrationConfig['fieldConfigurations'],
        fieldDefinitions: [],
      });
      mockUseOrderedAddressHierarchyLevels.mockReturnValue({
        orderedFields: [],
        isLoadingFieldOrder: false,
        errorFetchingFieldOrder: undefined,
      });

      const { getValues } = renderWithRegistrationForm(
        <ResourcesContextProvider value={mockResourcesContextValue}>
          <AddressComponent />
        </ResourcesContextProvider>,
        { initialValues: mockInitialFormValues },
      );

      expect(getValues().address).toEqual(mockedAddressTemplate.elementDefaults);
    });
  });
});

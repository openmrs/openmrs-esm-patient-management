import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockedAddressTemplate, mockedOrderedFields, mockOpenmrsId, mockPatient, mockSession } from '__mocks__';
import { type AddressTemplate } from '../../../patient-registration.types';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../../config-schema';
import { type Resources, ResourcesContext } from '../../../../offline.resources';
import {
  PatientRegistrationContext,
  type PatientRegistrationContextProps,
} from '../../../patient-registration-context';
import { useOrderedAddressHierarchyLevels } from '../address-hierarchy.resource';
import { AddressComponent } from '../address-field.component';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);
const mockUseOrderedAddressHierarchyLevels = jest.mocked(useOrderedAddressHierarchyLevels);

const mockResourcesContextValue = {
  addressTemplate: {} as AddressTemplate,
  currentSession: mockSession.data,
  identifierTypes: [],
  relationshipTypes: [],
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

const initialContextValues: PatientRegistrationContextProps = {
  currentPhoto: '',
  inEditMode: false,
  identifierTypes: [],
  initialFormValues: mockInitialFormValues,
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldValue: jest.fn(),
  setInitialFormValues: jest.fn(),
  validationSchema: null,
  values: mockInitialFormValues,
};

jest.mock('../address-hierarchy.resource', () => ({
  ...jest.requireActual('../address-hierarchy.resource'),
  useOrderedAddressHierarchyLevels: jest.fn(),
}));

async function renderAddressHierarchy(contextValues: PatientRegistrationContextProps) {
  await render(
    <ResourcesContext.Provider value={mockResourcesContextValue}>
      <Formik initialValues={mockInitialFormValues} onSubmit={null}>
        <Form>
          <PatientRegistrationContext.Provider value={contextValues}>
            <AddressComponent />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>
    </ResourcesContext.Provider>,
  );
}

describe('Address hierarchy', () => {
  it('renders a loading skeleton when the address template is loading', () => {
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
    });

    mockUseOrderedAddressHierarchyLevels.mockReturnValue({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: undefined,
    });

    renderAddressHierarchy(initialContextValues);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a loading skeleton when the address hierarchy feature is enabled and address hierarchy order levels are loading', () => {
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
    });

    mockUseOrderedAddressHierarchyLevels.mockReturnValue({
      orderedFields: [],
      isLoadingFieldOrder: true,
      errorFetchingFieldOrder: undefined,
    });

    renderAddressHierarchy(initialContextValues);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a loading skeleton when the address hierarchy feature is enabled and address hierarchy order levels are loading', () => {
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
    });

    mockUseOrderedAddressHierarchyLevels.mockReturnValue({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: undefined,
    });

    renderAddressHierarchy(initialContextValues);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders the address component with address hierarchy disabled', () => {
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
    });

    mockUseOrderedAddressHierarchyLevels.mockReturnValue({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: undefined,
    });

    mockResourcesContextValue.addressTemplate = mockedAddressTemplate;

    renderAddressHierarchy(initialContextValues);

    const allFields = mockedAddressTemplate.lines.flat().filter(({ isToken }) => isToken === 'IS_ADDR_TOKEN');
    allFields.forEach((field) => {
      const textFieldInput = screen.getByLabelText(`${field.displayText} (optional)`);
      expect(textFieldInput).toBeInTheDocument();
    });
  });

  it('renders the address hierarchy fields in order if the address hierarchy feature is enabled', () => {
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
    });

    mockUseOrderedAddressHierarchyLevels.mockReturnValue({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: undefined,
    });

    mockResourcesContextValue.addressTemplate = mockedAddressTemplate;

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

  it('renders the quick search bar above the address hierarchy fields when the address hierarchy feature is enabled and useQuickSearch is set to true', () => {
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
    });

    mockUseOrderedAddressHierarchyLevels.mockReturnValue({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: undefined,
    });

    mockResourcesContextValue.addressTemplate = mockedAddressTemplate;

    renderAddressHierarchy(initialContextValues);

    const searchbox = screen.getByRole('searchbox', { name: /search address/i });
    expect(searchbox).toBeInTheDocument();
  });

  it('renders combobox fields when address hierarchy is enabled and searchAddressByLevel is set to true', () => {
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
    });

    mockUseOrderedAddressHierarchyLevels.mockReturnValue({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: undefined,
    });

    mockResourcesContextValue.addressTemplate = mockedAddressTemplate;

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

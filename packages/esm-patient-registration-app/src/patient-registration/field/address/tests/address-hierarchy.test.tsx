import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { AddressComponent } from '../address-field.component';
import { Formik, Form } from 'formik';
import { type Resources, ResourcesContext } from '../../../../offline.resources';
import { PatientRegistrationContext } from '../../../patient-registration-context';
import { useConfig } from '@openmrs/esm-framework';
import { useOrderedAddressHierarchyLevels } from '../address-hierarchy.resource';
import { mockedAddressTemplate, mockedOrderedFields } from '__mocks__';

// Mocking the AddressSearchComponent
jest.mock('../address-search.component', () => jest.fn(() => <div data-testid="address-search-bar" />));
// Mocking the AddressHierarchyLevels
jest.mock('../address-hierarchy-levels.component', () => jest.fn(() => <div data-testid="address-hierarchy-levels" />));
// Mocking the SkeletonText
jest.mock('@carbon/react', () => ({
  ...jest.requireActual('@carbon/react'),
  SkeletonText: jest.fn(() => <div data-testid="skeleton-text" />),
  InlineNotification: jest.fn(() => <div data-testid="inline-notification" />),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(),
}));

jest.mock('../address-hierarchy.resource', () => ({
  ...(jest.requireActual('../address-hierarchy.resource') as jest.Mock),
  useOrderedAddressHierarchyLevels: jest.fn(),
}));

async function renderAddressHierarchy(addressTemplate = mockedAddressTemplate) {
  await render(
    <ResourcesContext.Provider value={{ addressTemplate } as unknown as Resources}>
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <PatientRegistrationContext.Provider value={{ setFieldValue: jest.fn() } as any}>
            <AddressComponent />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>
    </ResourcesContext.Provider>,
  );
}

describe('Testing address hierarchy', () => {
  beforeEach(cleanup);

  it('should render skeleton when address template is loading', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: false,
            useQuickSearch: false,
            searchAddressByLevel: false,
          },
        },
      },
    }));
    (useOrderedAddressHierarchyLevels as jest.Mock).mockImplementation(() => ({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: null,
    }));
    // @ts-ignore
    renderAddressHierarchy(null);
    const skeletonText = screen.getByTestId('skeleton-text');
    expect(skeletonText).toBeInTheDocument();
  });

  it('should render skeleton when address hierarchy is enabled and addresshierarchy order is loading', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: true,
            useQuickSearch: false,
            searchAddressByLevel: false,
          },
        },
      },
    }));
    (useOrderedAddressHierarchyLevels as jest.Mock).mockImplementation(() => ({
      orderedFields: [],
      isLoadingFieldOrder: true,
      errorFetchingFieldOrder: null,
    }));
    renderAddressHierarchy();
    const skeletonText = screen.getByTestId('skeleton-text');
    expect(skeletonText).toBeInTheDocument();
  });

  it('should render skeleton when address hierarchy is enabled and addresshierarchy order is loading', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: true,
            useQuickSearch: false,
            searchAddressByLevel: false,
          },
        },
      },
    }));
    (useOrderedAddressHierarchyLevels as jest.Mock).mockImplementation(() => ({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: true,
    }));
    renderAddressHierarchy();
    const inlineNotification = screen.getByTestId('inline-notification');
    expect(inlineNotification).toBeInTheDocument();
  });

  it('should render the address component with address hierarchy disabled', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: false,
            useQuickSearch: false,
            searchAddressByLevel: false,
          },
        },
      },
    }));
    (useOrderedAddressHierarchyLevels as jest.Mock).mockImplementation(() => ({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: null,
    }));
    renderAddressHierarchy();
    const allFields = mockedAddressTemplate.lines.flat().filter(({ isToken }) => isToken === 'IS_ADDR_TOKEN');
    allFields.forEach((field) => {
      const textFieldInput = screen.getByLabelText(`${field.displayText} (optional)`);
      expect(textFieldInput).toBeInTheDocument();
    });
  });

  it('should render the fields in order if the address hierarcy is enabled', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: true,
            useQuickSearch: false,
            searchAddressByLevel: false,
          },
        },
      },
    }));
    (useOrderedAddressHierarchyLevels as jest.Mock).mockImplementation(() => ({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: null,
    }));
    renderAddressHierarchy();
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

  it('should render quick search bar on above the fields when address hierarchy is enabled and quicksearch is set to true', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: true,
            useQuickSearch: true,
            searchAddressByLevel: false,
          },
        },
      },
    }));
    (useOrderedAddressHierarchyLevels as jest.Mock).mockImplementation(() => ({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: null,
    }));
    renderAddressHierarchy();
    const addressSearchBar = screen.getByTestId('address-search-bar');
    expect(addressSearchBar).toBeInTheDocument();
  });

  it('should render combo boxes fields when address hierarchy is enabled and searchAddressByLevel is set to true', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: true,
            useQuickSearch: false,
            searchAddressByLevel: true,
          },
        },
      },
    }));
    (useOrderedAddressHierarchyLevels as jest.Mock).mockImplementation(() => ({
      orderedFields: [],
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: null,
    }));
    renderAddressHierarchy();
    const addressHierarchyLevels = screen.getByTestId('address-hierarchy-levels');
    expect(addressHierarchyLevels).toBeInTheDocument();
  });
});

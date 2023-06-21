import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { AddressComponent } from '../address-field.component';
import { Formik, Form } from 'formik';
import { Resources, ResourcesContext } from '../../../../offline.resources';
import { PatientRegistrationContext } from '../../../patient-registration-context';
import { useConfig } from '@openmrs/esm-framework';
import { useOrderedAddressHierarchyLevels } from '../address-hierarchy.resource';
import { mockResponse1, mockResponse2, mockedOrderedFields } from './mocks';
import AddressHierarchyLevels from '../address-hierarchy-levels.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(),
}));

jest.mock('../address-hierarchy.resource', () => ({
  ...(jest.requireActual('../address-hierarchy.resource') as jest.Mock),
  useOrderedAddressHierarchyLevels: jest.fn(),
}));

async function testAddressHierarchy(mockResponse) {
  await render(
    <ResourcesContext.Provider value={{ addressTemplate: mockResponse } as Resources}>
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <PatientRegistrationContext.Provider
            value={{ setFieldValue: jest.fn(), setInitialFormValues: jest.fn(), values: { address: {} } }}>
            <AddressComponent />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>
    </ResourcesContext.Provider>,
  );

  const countryInput = screen.getByLabelText('Country (optional)');
  expect(countryInput).toBeInTheDocument();
  expect(countryInput).toHaveAttribute('name', 'address.country');
  const stateInput = screen.getByLabelText('State (optional)');
  expect(stateInput).toBeInTheDocument();
  expect(stateInput).toHaveAttribute('name', 'address.stateProvince');
  const cityInput = screen.getByLabelText('City (optional)');
  expect(cityInput).toBeInTheDocument();
  expect(cityInput).toHaveAttribute('name', 'address.cityVillage');
  const address1Input = screen.getByLabelText('Address line 1 (optional)');
  expect(address1Input).toBeInTheDocument();
  expect(address1Input).toHaveAttribute('name', 'address.address1');
  const address2Input = screen.getByLabelText('Address line 2 (optional)');
  expect(address2Input).toBeInTheDocument();
  expect(address2Input).toHaveAttribute('name', 'address.address2');
  const postalCodeInput = screen.getByLabelText('Postcode (optional)');
  expect(postalCodeInput).toBeInTheDocument();
  expect(postalCodeInput).toHaveAttribute('name', 'address.postalCode');
}

function testInputFieldOrder() {
  // Fields must be in the order of the orderedFields
  const inputs = screen.getAllByRole('textbox');
  inputs.forEach((input, indx) => {
    const inputName = input.getAttribute('name');
    // Names are in the format of address.${name}
    const fieldName = inputName.split('.')?.[1];
    expect(fieldName).toBe(mockedOrderedFields[indx]);
  });
}

describe('address hierarchy', () => {
  beforeAll(() => {
    (useOrderedAddressHierarchyLevels as jest.Mock).mockImplementation(() => ({
      orderedFields: mockedOrderedFields,
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: null,
    }));
  });

  beforeEach(cleanup);

  it('renders text input fields matching addressTemplate config', async () => {
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
    testAddressHierarchy(mockResponse1);
    // For cleaning up the input fields generated in first render
    cleanup();
    testAddressHierarchy(mockResponse2);
  });

  it('renders combo input fields matching addressTemplate config', async () => {
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

    testAddressHierarchy(mockResponse1);
    const searchBox = screen.getByRole('searchbox');
    expect(searchBox).toBeInTheDocument();
    expect(searchBox.getAttribute('placeholder')).toBe('Search address');
    testInputFieldOrder();
    // For cleaning up the input fields generated in first render
    cleanup();
    testAddressHierarchy(mockResponse2);
    testInputFieldOrder();
  });

  it('renders combo input fields matching addressTemplate config and ordered fields', async () => {
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

    testAddressHierarchy(mockResponse1);
    testInputFieldOrder();
    // For cleaning up the input fields generated in first render
    cleanup();
    testAddressHierarchy(mockResponse2);
    testInputFieldOrder();
  });
});

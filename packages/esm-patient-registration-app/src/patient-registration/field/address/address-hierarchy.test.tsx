import React from 'react';
import { render, screen } from '@testing-library/react';
import { AddressHierarchy } from './address-hierarchy.component';
import { Formik, Form } from 'formik';
import { Resources, ResourcesContext } from '../../../offline.resources';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useConfig } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(),
}));

const mockResponse1 = {
  results: [
    {
      value:
        '<?xml version="1.0" encoding="UTF-8"?> \
          <org.openmrs.layout.address.AddressTemplate> \
            <nameMappings class="properties"> \
                <property name="postalCode" value="Postcode" /> \
                <property name="address1" value="Address line 1" /> \
                <property name="address2" value="Address line 2" /> \
                <property name="country" value="Country" /> \
                <property name="stateProvince" value="State" /> \
                <property name="cityVillage" value="City" /> \
            </nameMappings> \
            <sizeMappings class="properties"> \
                <property name="postalCode" value="10" /> \
                <property name="address2" value="40" /> \
                <property name="address1" value="40" /> \
                <property name="country" value="10" /> \
                <property name="stateProvince" value="10" /> \
                <property name="cityVillage" value="10" /> \
            </sizeMappings> \
            <lineByLineFormat> \
                <string> address1</string> \
                <string> address2</string> \
                <string> cityVillage stateProvince country postalCode</string> \
            </lineByLineFormat> \
            <requiredElements /> \
        </org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};

const mockResponse2 = {
  results: [
    {
      value:
        '<org.openmrs.layout.address.AddressTemplate> \
          <nameMappings> \
            <entry> \
              <string>country</string> \
              <string>Country</string> \
            </entry> \
            <entry> \
              <string>postalCode</string> \
              <string>Postcode</string> \
            </entry> \
            <entry> \
              <string>address1</string> \
              <string>Address line 1</string> \
            </entry> \
            <entry> \
              <string>address2</string> \
              <string>Address line 2</string> \
            </entry> \
            <entry> \
              <string>stateProvince</string> \
              <string>State</string> \
            </entry> \
            <entry> \
              <string>cityVillage</string> \
              <string>City</string> \
            </entry> \
          </nameMappings> \
          <sizeMappings> \
            <entry> \
              <string>country</string> \
              <string>40</string> \
            </entry> \
            <entry> \
              <string>countyDistrict</string> \
              <string>40</string> \
            </entry> \
            <entry> \
              <string>address1</string> \
              <string>40</string> \
            </entry> \
            <entry> \
              <string>stateProvince</string> \
              <string>40</string> \
            </entry> \
            <entry> \
              <string>cityVillage</string> \
              <string>40</string> \
            </entry> \
          </sizeMappings> \
          <elementDefaults> \
            <entry> \
              <string>country</string> \
              <string>Cambodia</string> \
            </entry> \
          </elementDefaults> \
          <lineByLineFormat> \
            <string>cityVillage, address1</string> \
            <string>countyDistrict, stateProvince</string> \
            <string>country</string> \
          </lineByLineFormat> \
          <maxTokens>0</maxTokens> \
        </org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};

async function testAddressHierarchy(mockResponse) {
  await render(
    <ResourcesContext.Provider value={{ addressTemplate: mockResponse } as Resources}>
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <PatientRegistrationContext.Provider value={{ setFieldValue: jest.fn() }}>
            <AddressHierarchy />
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

describe('address hierarchy', () => {
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
    testAddressHierarchy(mockResponse2);
  });

  it('renders combo input fields matching addressTemplate config', async () => {
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
    testAddressHierarchy(mockResponse2);
  });
});

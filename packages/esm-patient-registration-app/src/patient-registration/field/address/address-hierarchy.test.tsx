import React from 'react';
import { render, screen } from '@testing-library/react';
import { AddressHierarchy } from './address-hierarchy.component';
import { Formik, Form } from 'formik';
import { Resources, ResourcesContext } from '../../../offline.resources';
import { PatientRegistrationContext } from '../../patient-registration-context';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: () => ({
    fieldConfigurations: {
      address: {
        useAddressHierarchy: {
          enabled: false,
          useQuickSearch: false,
          searchAddressByLevel: false,
        },
      },
    },
  }),
}));

const mockResponse = {
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

describe('address hierarchy', () => {
  it('renders input fields matching addressTemplate config', async () => {
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

    expect(screen.getByText('Country (optional)')).toBeInTheDocument();
    expect(screen.getByText('State (optional)')).toBeInTheDocument();
    expect(screen.getByText('City (optional)')).toBeInTheDocument();
    expect(screen.getByText('Address line 1 (optional)')).toBeInTheDocument();
    expect(screen.getByText('Address line 2 (optional)')).toBeInTheDocument();
    expect(screen.getByText('Postcode (optional)')).toBeInTheDocument();
  });
});

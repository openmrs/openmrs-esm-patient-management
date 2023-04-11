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
        '<org.openmrs.layout.address.AddressTemplate>     <nameMappings class="properties">       <property name="postalCode" value="Location.postalCode"/>       <property name="address2" value="Location.address2"/>       <property name="address1" value="Location.address1"/>       <property name="country" value="country"/>       <property name="stateProvince" value="stateProvince"/>       <property name="cityVillage" value="cityVillage"/>     </nameMappings>     <sizeMappings class="properties">       <property name="postalCode" value="10"/>       <property name="address2" value="40"/>       <property name="address1" value="40"/>       <property name="country" value="10"/>       <property name="stateProvince" value="10"/>       <property name="cityVillage" value="10"/>     </sizeMappings>     <lineByLineFormat>       <string>address1</string>       <string>address2</string>       <string>cityVillage stateProvince country postalCode</string>     </lineByLineFormat>    <requiredElements></requiredElements> </org.openmrs.layout.address.AddressTemplate>',
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

    expect(screen.getByText('country (optional)')).toBeInTheDocument();
    expect(screen.getByText('stateProvince (optional)')).toBeInTheDocument();
    expect(screen.getByText('cityVillage (optional)')).toBeInTheDocument();
  });
});

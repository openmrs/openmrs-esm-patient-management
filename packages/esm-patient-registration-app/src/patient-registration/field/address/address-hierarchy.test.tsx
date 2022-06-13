import React from 'react';
import { render } from '@testing-library/react';
import { AddressHierarchy } from './address-hierarchy.component';
import { Formik, Form } from 'formik';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import { Resources, ResourcesContext } from '../../../offline.resources';

const mockResponse = {
  results: [
    {
      value:
        '<org.openmrs.layout.address.AddressTemplate>\r\n<nameMappings class="properties">\r\n<property name="postalCode" value="Location.postalCode"/>\r\n<property name="address1" value="Location.address1"/>\r\n<property name="country" value="Location.country"/>\r\n<property name="stateProvince" value="Location.stateProvince"/>\r\n<property name="cityVillage" value="Location.cityVillage"/>\r\n</nameMappings>\r\n<elementDefaults class="properties">\r\n<property name="country" value="Uganda"/>\r\n</elementDefaults>\r\n</org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};

describe('address hierarchy', () => {
  it('renders input fields matching addressTemplate config', async () => {
    const { findByLabelText } = render(
      <ResourcesContext.Provider value={{ addressTemplate: mockResponse } as Resources}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <AddressHierarchy />
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );

    const postalCode = await findByLabelText('Location.postalCode');
    const address1 = await findByLabelText('Location.address1');
    const country = await findByLabelText('Location.country');
    const stateProvince = await findByLabelText('Location.stateProvince');
    const cityVillage = await findByLabelText('Location.cityVillage');

    expect(postalCode).toBeInTheDocument();
    expect(address1).toBeInTheDocument();
    expect(country).toBeInTheDocument();
    expect(stateProvince).toBeInTheDocument();
    expect(cityVillage).toBeInTheDocument();
  });
});

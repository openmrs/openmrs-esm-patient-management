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
        '<org.openmrs.layout.address.AddressTemplate>\r\n<nameMappings>\r\n<entry>\r\n<string>country</string>\r\n<string>Location.country</string>\r\n</entry>\r\n<entry>\r\n<string>stateProvince</string>\r\n<string>Location.province</string>\r\n</entry>\r\n<entry>\r\n<string>countyDistrict</string>\r\n<string>Location.district</string>\r\n</entry>\r\n<entry>\r\n<string>cityVillage</string>\r\n<string>Location.village</string>\r\n</entry>\r\n</nameMappings></org.openmrs.layout.address.AddressTemplate>',
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

    const country = await findByLabelText('Location.country');
    const stateProvince = await findByLabelText('Location.province');
    const cityVillage = await findByLabelText('Location.village');
    const countyDistrict = await findByLabelText('Location.district');

    expect(country).toBeInTheDocument();
    expect(stateProvince).toBeInTheDocument();
    expect(cityVillage).toBeInTheDocument();
    expect(countyDistrict).toBeInTheDocument();
  });
});

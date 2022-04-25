import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { ContactInfoSection } from './contact-info-section.component';
import { initialFormValues } from '../../patient-registration.component';
import { Resources, ResourcesContext } from '../../../offline.resources';

const predefinedAddressTemplate = {
  results: [
    {
      value:
        '<org.openmrs.layout.address.AddressTemplate>\r\n     <nameMappings class="properties">\r\n       <property name="postalCode" value="Location.postalCode"/>\r\n       <property name="address2" value="Location.address2"/>\r\n       <property name="address1" value="Location.address1"/>\r\n       <property name="country" value="Location.country"/>\r\n       <property name="stateProvince" value="Location.stateProvince"/>\r\n       <property name="cityVillage" value="Location.cityVillage"/>\r\n     </nameMappings>\r\n     <sizeMappings class="properties">\r\n       <property name="postalCode" value="4"/>\r\n       <property name="address1" value="40"/>\r\n       <property name="address2" value="40"/>\r\n       <property name="country" value="10"/>\r\n       <property name="stateProvince" value="10"/>\r\n       <property name="cityVillage" value="10"/>\r\n       <asset name="cityVillage" value="10"/>\r\n     </sizeMappings>\r\n     <lineByLineFormat>\r\n       <string>address1 address2</string>\r\n       <string>cityVillage stateProvince postalCode</string>\r\n       <string>country</string>\r\n     </lineByLineFormat>\r\n     <elementDefaults class="properties">\r\n            <property name="country" value=""/>\r\n     </elementDefaults>\r\n     <elementRegex class="properties">\r\n            <property name="address1" value="[a-zA-Z]+$"/>\r\n     </elementRegex>\r\n     <elementRegexFormats class="properties">\r\n            <property name="address1" value="Countries can only be letters"/>\r\n     </elementRegexFormats>\r\n   </org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};

jest.mock('../../field/name/name-field.component', () => {
  return {
    NameField: () => (
      <div>
        <input type="text" name="name" />
      </div>
    ),
  };
});

const mockResourcesContextValue = {
  addressTemplate: predefinedAddressTemplate,
  currentSession: { authenticated: true, sessionId: 'JSESSION' },
  relationshipTypes: [],
  identifierTypes: [],
} as Resources;

describe('contact info section', () => {
  const setupSection = async (fields) => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{ ...initialFormValues }} onSubmit={null}>
          <Form>
            <ContactInfoSection fields={fields} id="contact" />
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    const allInputs = screen.getAllByRole('textbox') as Array<HTMLInputElement>;
    return allInputs.map((input) => input.name);
  };

  it('has 8 fields', async () => {
    const inputNames = await setupSection(['address', 'phone & email']);
    expect(inputNames.length).toBe(8);
  });

  it('has only one fields', async () => {
    const inputNames = await setupSection(['name']);
    expect(inputNames.length).toBe(1);
  });
});

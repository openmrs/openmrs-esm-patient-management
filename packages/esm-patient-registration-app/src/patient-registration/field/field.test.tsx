import React from 'react';
import { render, screen } from '@testing-library/react';
import { Field } from './field.component';
import { useConfig } from '@openmrs/esm-framework';
import { PatientRegistrationContext } from '../patient-registration-context';
import { Resources, ResourcesContext } from '../../offline.resources';
import { Form, Formik } from 'formik';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(),
}));
const predefinedAddressTemplate = {
  results: [
    {
      value:
        '<org.openmrs.layout.address.AddressTemplate>\r\n     <nameMappings class="properties">\r\n       <property name="postalCode" value="Location.postalCode"/>\r\n       <property name="address2" value="Location.address2"/>\r\n       <property name="address1" value="Location.address1"/>\r\n       <property name="country" value="Location.country"/>\r\n       <property name="stateProvince" value="Location.stateProvince"/>\r\n       <property name="cityVillage" value="Location.cityVillage"/>\r\n     </nameMappings>\r\n     <sizeMappings class="properties">\r\n       <property name="postalCode" value="4"/>\r\n       <property name="address1" value="40"/>\r\n       <property name="address2" value="40"/>\r\n       <property name="country" value="10"/>\r\n       <property name="stateProvince" value="10"/>\r\n       <property name="cityVillage" value="10"/>\r\n       <asset name="cityVillage" value="10"/>\r\n     </sizeMappings>\r\n     <lineByLineFormat>\r\n       <string>address1 address2</string>\r\n       <string>cityVillage stateProvince postalCode</string>\r\n       <string>country</string>\r\n     </lineByLineFormat>\r\n     <elementDefaults class="properties">\r\n            <property name="country" value=""/>\r\n     </elementDefaults>\r\n     <elementRegex class="properties">\r\n            <property name="address1" value="[a-zA-Z]+$"/>\r\n     </elementRegex>\r\n     <elementRegexFormats class="properties">\r\n            <property name="address1" value="Countries can only be letters"/>\r\n     </elementRegexFormats>\r\n   </org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};

const mockedIdentifierTypes = [
  {
    fieldName: 'openMrsId',
    format: null,
    identifierSources: [
      {
        uuid: '8549f706-7e85-4c1d-9424-217d50a2988b',
        name: 'Generator for OpenMRS ID',
        description: 'Generator for OpenMRS ID',
        baseCharacterSet: '0123456789ACDEFGHJKLMNPRTUVWXY',
        prefix: '',
      },
    ],
    isPrimary: true,
    name: 'OpenMRS ID',
    required: true,
    uniquenessBehavior: 'UNIQUE',
    uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
  },
  {
    fieldName: 'idCard',
    format: null,
    identifierSources: [],
    isPrimary: false,
    name: 'ID Card',
    required: false,
    uniquenessBehavior: 'UNIQUE',
    uuid: 'b4143563-16cd-4439-b288-f83d61670fc8',
  },
  {
    fieldName: 'legacyId',
    format: null,
    identifierSources: [],
    isPrimary: false,
    name: 'Legacy ID',
    required: false,
    uniquenessBehavior: null,
    uuid: '22348099-3873-459e-a32e-d93b17eda533',
  },
  {
    fieldName: 'oldIdentificationNumber',
    format: '',
    identifierSources: [],
    isPrimary: false,
    name: 'Old Identification Number',
    required: false,
    uniquenessBehavior: null,
    uuid: '8d79403a-c2cc-11de-8d13-0010c6dffd0f',
  },
  {
    fieldName: 'openMrsIdentificationNumber',
    format: '',
    identifierSources: [],
    isPrimary: false,
    name: 'OpenMRS Identification Number',
    required: false,
    uniquenessBehavior: null,
    uuid: '8d793bee-c2cc-11de-8d13-0010c6dffd0f',
  },
];
const mockResourcesContextValue = {
  addressTemplate: predefinedAddressTemplate,
  currentSession: {
    authenticated: true,
    sessionId: 'JSESSION',
    currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
  },
  relationshipTypes: [],
  identifierTypes: [...mockedIdentifierTypes],
} as Resources;

describe('Field', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render NameField component when name prop is "name"', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        name: {
          displayMiddleName: true,
          unidentifiedPatient: true,
          defaultUnknownGivenName: 'UNKNOWN',
          defaultUnknownFamilyName: 'UNKNOWN',
        },
      },
    }));
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                setFieldValue: jest.fn(),
                setInitialFormValues: jest.fn(),
                values: {},
              }}>
              <Field name="name" />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    expect(screen.getByText('Full Name')).toBeInTheDocument();
  });

  it('should render GenderField component when name prop is "gender"', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        gender: [
          {
            value: 'Male',
            label: 'Male',
            id: 'male',
          },
        ],
      },
    }));
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                setFieldValue: jest.fn(),
                setInitialFormValues: jest.fn(),
                values: {},
              }}>
              <Field name="gender" />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    expect(screen.getByLabelText('Male')).toBeInTheDocument();
  });

  it('should render DobField component when name prop is "dob"', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldConfigurations: {
        dob: {
          minAgeLimit: 0,
          maxAgeLimit: 120,
        },
      },
    }));
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                setFieldValue: jest.fn(),
                setInitialFormValues: jest.fn(),
                values: {},
              }}>
              <Field name="dob" />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    expect(screen.getByText('Birth')).toBeInTheDocument();
  });

  it('should render AddressComponent component when name prop is "address"', () => {
    jest.mock('./address/address-hierarchy.resource', () => ({
      ...(jest.requireActual('../address-hierarchy.resource') as jest.Mock),
      useOrderedAddressHierarchyLevels: jest.fn(),
    }));
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
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                setFieldValue: jest.fn(),
                setInitialFormValues: jest.fn(),
                values: {},
              }}>
              <Field name="address" />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('should render Identifiers component when name prop is "id"', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      defaultPatientIdentifierTypes: ['OpenMRS ID'],
    }));
    // initial value for the identifiers field
    const openmrsID = {
      name: 'OpenMRS ID',
      fieldName: 'openMrsId',
      required: true,
      uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
      format: null,
      isPrimary: true,
      identifierSources: [
        {
          uuid: '691eed12-c0f1-11e2-94be-8c13b969e334',
          name: 'Generator 1 for OpenMRS ID',
          autoGenerationOption: {
            manualEntryEnabled: false,
            automaticGenerationEnabled: true,
          },
        },
        {
          uuid: '01af8526-cea4-4175-aa90-340acb411771',
          name: 'Generator 2 for OpenMRS ID',
          autoGenerationOption: {
            manualEntryEnabled: true,
            automaticGenerationEnabled: true,
          },
        },
      ],
      autoGenerationSource: null,
    };
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                setFieldValue: jest.fn(),
                initialFormValues: { identifiers: { openmrsID } },
                setInitialFormValues: jest.fn(),
                values: {
                  identifiers: { openmrsID },
                },
              }}>
              <Field name="id" />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    expect(screen.getByText('Identifiers')).toBeInTheDocument();
  });

  it('should return null and report an error for an invalid field name', () => {
    (useConfig as jest.Mock).mockImplementation(() => ({
      fieldDefinitions: [{ id: 'weight' }],
    }));
    let error = null;
    try {
      render(<Field name="invalidField" />);
    } catch (err) {
      error = err;
    }
    expect(error).toBe(
      "Invalid field name 'invalidField'. Valid options are 'weight', 'name', 'gender', 'dob', 'address', 'id', 'phone & email'.",
    );
    expect(screen.queryByTestId('invalid-field')).not.toBeInTheDocument();
  });
});

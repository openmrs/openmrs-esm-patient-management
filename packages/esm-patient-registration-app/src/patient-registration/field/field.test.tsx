import React from 'react';
import dayjs from 'dayjs';
import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { Field } from './field.component';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../../config-schema';
import { type Resources, ResourcesContext } from '../../offline.resources';
import type { AddressTemplate, FormValues } from '../patient-registration.types';
import { PatientRegistrationContext } from '../patient-registration-context';

const mockOpenmrsDatePicker = jest.mocked(OpenmrsDatePicker);
const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

mockOpenmrsDatePicker.mockImplementation(({ id, labelText, value, onChange }) => {
  return (
    <>
      <label htmlFor={id}>{labelText}</label>
      <input
        id={id}
        // @ts-ignore
        value={value ? dayjs(value).format('DD/MM/YYYY') : ''}
        onChange={(evt) => {
          onChange(dayjs(evt.target.value).toDate());
        }}
      />
    </>
  );
});

const predefinedAddressTemplate = {
  uuid: 'test-address-template-uuid',
  property: 'layout.address.format',
  description: 'Test Address Template',
  display:
    'Layout - Address Format = <org.openmrs.layout.address.AddressTemplate>\n     <nameMappings class="properties">\n       <property name="postalCode" value="Location.postalCode"/>\n       <property name="address2" value="Location.address2"/>\n       <property name="address1" value="Location.address1"/>\n       <property name="country" value="Location.country"/>\n       <property name="stateProvince" value="Location.stateProvince"/>\n       <property name="cityVillage" value="Location.cityVillage"/>\n     </nameMappings>\n     <sizeMappings class="properties">\n       <property name="postalCode" value="10"/>\n       <property name="address2" value="40"/>\n       <property name="address1" value="40"/>\n       <property name="country" value="10"/>\n       <property name="stateProvince" value="10"/>\n       <property name="cityVillage" value="10"/>\n     </sizeMappings>\n     <lineByLineFormat>\n       <string>address1</string>\n       <string>address2</string>\n       <string>cityVillage stateProvince country postalCode</string>\n     </lineByLineFormat>\n   </org.openmrs.layout.address.AddressTemplate>',
  value:
    '<org.openmrs.layout.address.AddressTemplate>\r\n     <nameMappings class="properties">\r\n       <property name="postalCode" value="Location.postalCode"/>\r\n       <property name="address2" value="Location.address2"/>\r\n       <property name="address1" value="Location.address1"/>\r\n       <property name="country" value="Location.country"/>\r\n       <property name="stateProvince" value="Location.stateProvince"/>\r\n       <property name="cityVillage" value="Location.cityVillage"/>\r\n     </nameMappings>\r\n     <sizeMappings class="properties">\r\n       <property name="postalCode" value="4"/>\r\n       <property name="address1" value="40"/>\r\n       <property name="address2" value="40"/>\r\n       <property name="country" value="10"/>\r\n       <property name="stateProvince" value="10"/>\r\n       <property name="cityVillage" value="10"/>\r\n       <asset name="cityVillage" value="10"/>\r\n     </sizeMappings>\r\n     <lineByLineFormat>\r\n       <string>address1 address2</string>\r\n       <string>cityVillage stateProvince postalCode</string>\r\n       <string>country</string>\r\n     </lineByLineFormat>\r\n     <elementDefaults class="properties">\r\n            <property name="country" value=""/>\r\n     </elementDefaults>\r\n     <elementRegex class="properties">\r\n            <property name="address1" value="[a-zA-Z]+$"/>\r\n     </elementRegex>\r\n     <elementRegexFormats class="properties">\r\n            <property name="address1" value="Countries can only be letters"/>\r\n     </elementRegexFormats>\r\n   </org.openmrs.layout.address.AddressTemplate>',
};

const mockIdentifierTypes = [
  {
    fieldName: 'openMrsId',
    format: '',
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
    uniquenessBehavior: 'UNIQUE' as const,
    uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
  },
  {
    fieldName: 'idCard',
    format: '',
    identifierSources: [],
    isPrimary: false,
    name: 'ID Card',
    required: false,
    uniquenessBehavior: 'UNIQUE' as const,
    uuid: 'b4143563-16cd-4439-b288-f83d61670fc8',
  },
  {
    fieldName: 'legacyId',
    format: '',
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

const mockResourcesContextValue: Resources = {
  addressTemplate: predefinedAddressTemplate as unknown as AddressTemplate,
  currentSession: {
    authenticated: true,
    sessionId: 'JSESSION',
    currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
  },
  relationshipTypes: [],
  identifierTypes: [...mockIdentifierTypes],
};

const initialContextValues = {
  currentPhoto: 'data:image/png;base64,1234567890',
  identifierTypes: [],
  inEditMode: false,
  initialFormValues: {} as FormValues,
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldValue: jest.fn(),
  setInitialFormValues: jest.fn(),
  validationSchema: null,
  values: {} as FormValues,
};

describe('Field', () => {
  let ContextWrapper;

  beforeEach(() => {
    ContextWrapper = ({ children }) => (
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Form>
            <PatientRegistrationContext.Provider value={initialContextValues}>
              {children}
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>
    );

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
    });
  });

  it('should render NameField component when name prop is "name"', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        name: {
          allowUnidentifiedPatients: true,
          displayMiddleName: true,
          defaultUnknownGivenName: 'UNKNOWN',
          defaultUnknownFamilyName: 'UNKNOWN',
        },
      } as RegistrationConfig['fieldConfigurations'],
    });

    render(<Field name="name" />, { wrapper: ContextWrapper });
    expect(screen.getByText('Full Name')).toBeInTheDocument();
  });

  it('should render GenderField component when name prop is "gender"', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        gender: [
          {
            value: 'Male',
            label: 'Male',
            id: 'male',
          },
        ],
      } as unknown as RegistrationConfig['fieldConfigurations'],
    });

    render(<Field name="gender" />, { wrapper: ContextWrapper });
    expect(screen.getByLabelText('Male')).toBeInTheDocument();
  });

  it('should render DobField component when name prop is "dob"', () => {
    render(<Field name="dob" />, { wrapper: ContextWrapper });
    expect(screen.getByText('Birth')).toBeInTheDocument();
  });

  it('should render AddressComponent component when name prop is "address"', () => {
    jest.mock('./address/address-hierarchy.resource', () => ({
      ...jest.requireActual('../address-hierarchy.resource'),
      useOrderedAddressHierarchyLevels: jest.fn(),
    }));

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

    render(<Field name="address" />, { wrapper: ContextWrapper });
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('should render Identifiers component when name prop is "id"', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      defaultPatientIdentifierTypes: ['OpenMRS ID'],
    });

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
      identifierUuid: 'openmrs-identifier-uuid',
      identifierTypeUuid: 'openmrs-id-identifier-type-uuid',
      initialValue: '12345',
      identifierValue: '12345',
      identifierName: 'OpenMRS ID',
      preferred: true,
      selectedSource: {
        uuid: 'openmrs-id-selected-source-uuid',
        name: 'Generator 1 for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: false,
          automaticGenerationEnabled: true,
        },
      },
      autoGenerationSource: null,
    };

    const updatedContextValues = {
      currentPhoto: 'data:image/png;base64,1234567890',
      identifierTypes: [],
      inEditMode: false,
      initialFormValues: { identifiers: { openmrsID } } as unknown as FormValues,
      isOffline: false,
      setCapturePhotoProps: jest.fn(),
      setFieldValue: jest.fn(),
      setInitialFormValues: jest.fn(),
      validationSchema: null,
      values: { identifiers: { openmrsID } } as unknown as FormValues,
    };

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Form>
            <PatientRegistrationContext.Provider value={updatedContextValues}>
              <Field name="id" />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    expect(screen.getByText('Identifiers')).toBeInTheDocument();
  });

  it('should return null and report an error for an invalid field name', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldDefinitions: [{ id: 'weight' }] as RegistrationConfig['fieldDefinitions'],
    });

    let error = null;

    try {
      render(<Field name="invalidField" />);
    } catch (err) {
      error = err;
    }

    expect(error).toMatch(/Invalid field name 'invalidField'. Valid options are /);
    expect(screen.queryByTestId('invalid-field')).not.toBeInTheDocument();

    consoleError.mockRestore();
  });
});

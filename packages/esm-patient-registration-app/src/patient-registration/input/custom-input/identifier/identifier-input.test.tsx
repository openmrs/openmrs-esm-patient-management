import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { IdentifierInput } from './identifier-input.component';
import { initialFormValues } from '../../../patient-registration.component';
import { PatientIdentifierType } from '../../../patient-registration-types';
import { PatientRegistrationContext } from '../../../patient-registration-context';
import { Resources, ResourcesContext } from '../../../../offline.resources';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    validator: jest.fn(),
  };
});

jest.mock('../../basic-input/input/input.component.tsx', () => ({
  ...jest.requireActual('../../basic-input/input/input.component.tsx'),
}));

// jest.mock('formik', () => ({
//   ...jest.requireActual('formik'),
//   useField: jest.fn(),
// }));
const predefinedAddressTemplate = {
  results: [
    {
      value:
        '<org.openmrs.layout.address.AddressTemplate>\r\n     <nameMappings class="properties">\r\n       <property name="postalCode" value="Location.postalCode"/>\r\n       <property name="address2" value="Location.address2"/>\r\n       <property name="address1" value="Location.address1"/>\r\n       <property name="country" value="Location.country"/>\r\n       <property name="stateProvince" value="Location.stateProvince"/>\r\n       <property name="cityVillage" value="Location.cityVillage"/>\r\n     </nameMappings>\r\n     <sizeMappings class="properties">\r\n       <property name="postalCode" value="4"/>\r\n       <property name="address1" value="40"/>\r\n       <property name="address2" value="40"/>\r\n       <property name="country" value="10"/>\r\n       <property name="stateProvince" value="10"/>\r\n       <property name="cityVillage" value="10"/>\r\n       <asset name="cityVillage" value="10"/>\r\n     </sizeMappings>\r\n     <lineByLineFormat>\r\n       <string>address1 address2</string>\r\n       <string>cityVillage stateProvince postalCode</string>\r\n       <string>country</string>\r\n     </lineByLineFormat>\r\n     <elementDefaults class="properties">\r\n            <property name="country" value=""/>\r\n     </elementDefaults>\r\n     <elementRegex class="properties">\r\n            <property name="address1" value="[a-zA-Z]+$"/>\r\n     </elementRegex>\r\n     <elementRegexFormats class="properties">\r\n            <property name="address1" value="Countries can only be letters"/>\r\n     </elementRegexFormats>\r\n   </org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};
// jest.mock('react', () => ({
//   ...jest.requireActual('react'),
//   useMemo: jest.fn((callback) => callback()),
// }));

const mockIdentifierTypes = [
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
  identifierTypes: [...mockIdentifierTypes],
} as Resources;

const mockPatientIdentifier = {
  identifierUuid: '8549f706-7e85-4c1d-9424-217d50a2988b',
  identifierTypeUuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
  initialValue: '',
  identifierValue: 'auto-generated',
  identifierName: 'OpenMRS ID',
  selectedSource: {
    uuid: '8549f706-7e85-4c1d-9424-217d50a2988b',
    name: 'Generator for OpenMRS ID',
  },
  autoGeneration: false,
  preferred: true,
  required: true,
};

describe('identifier input', () => {
  const mockSetFieldValue = jest.fn();
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
          automaticGenerationEnabled: false,
        },
      },
      {
        uuid: '01af8526-cea4-4175-aa90-340acb411771',
        name: 'Generator 2 for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: true,
          automaticGenerationEnabled: false,
        },
      },
    ],
    autoGenerationSource: null,
  };
  const setupIdentifierInput = async (identifierType: PatientIdentifierType) => {
    initialFormValues['source-for-' + identifierType.fieldName] = identifierType.identifierSources[0].name;
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={initialFormValues} onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                initialFormValues: null,
                identifierTypes: [...mockIdentifierTypes],
                validationSchema: {},
                setValidationSchema: () => {},
                values: { ...initialFormValues },
                inEditMode: false,
                setFieldValue: mockSetFieldValue,
                currentPhoto: 'TEST',
                isOffline: false,
                setCapturePhotoProps: (value) => {},
              }}>
              <IdentifierInput patientIdentifier={mockPatientIdentifier} fieldName="openMrsId" />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    const identifierInput = screen.getByLabelText(identifierType.name) as HTMLInputElement;
    let identifierSourceSelectInput = undefined;
    try {
      identifierSourceSelectInput = screen.getByLabelText('source-for-' + identifierType.fieldName) as HTMLInputElement;
    } catch (e) {}
    return {
      identifierInput,
      identifierSourceSelectInput,
    };
  };

  it('exists', async () => {
    const { identifierInput, identifierSourceSelectInput } = await setupIdentifierInput(openmrsID);
    expect(identifierInput.type).toBe('text');
    // expect(identifierSourceSelectInput.type).toBe('select-one');
  });

  // it('has correct props for identifier source select input', async () => {
  //   const { identifierSourceSelectInput } = await setupIdentifierInput(openmrsID);
  //   expect(identifierSourceSelectInput.childElementCount).toBe(3);
  //   expect(identifierSourceSelectInput.value).toBe('Generator 1 for OpenMRS ID');
  // });

  // it.only('has correct props for identifier input', async () => {
  //   const { identifierInput } = await setupIdentifierInput(openmrsID);
  //   expect(identifierInput.placeholder).toBe('Auto-generated');
  //   expect(identifierInput.disabled).toBe(true);
  // });

  it('text input should not be disabled if manual entry is enabled', async () => {
    // setup
    openmrsID.identifierSources[0].autoGenerationOption.manualEntryEnabled = true;
    // replay
    const { identifierInput } = await setupIdentifierInput(openmrsID);
    screen.debug();
    // expect(identifierInput.placeholder).toBe('Auto-generated');
    expect(identifierInput.disabled).toBe(false);
  });

  it('user should be able to enter identifier if manual entry is enabled', async () => {
    // setup
    act(() => {
      openmrsID.identifierSources[0].autoGenerationOption.manualEntryEnabled = true;
    });

    const { identifierInput } = await setupIdentifierInput(openmrsID);
    act(() => {
      fireEvent.change(identifierInput, { target: { value: '123456' } });
    });
    expect(identifierInput.value).toBe('123456');
  });

  // it('should not render select widget if auto-entry is false', async () => {
  //   // setup
  //   openmrsID.identifierSources = [
  //     {
  //       uuid: '691eed12-c0f1-11e2-94be-8c13b969e334',
  //       name: 'Generator 1 for OpenMRS ID',
  //       autoGenerationOption: {
  //         manualEntryEnabled: true,
  //         automaticGenerationEnabled: false,
  //       },
  //     },
  //   ];
  //   // replay
  //   const { identifierInput, identifierSourceSelectInput } = await setupIdentifierInput(openmrsID);
  //   expect(identifierInput.placeholder).toBe('Enter identifier');
  //   expect(identifierInput.disabled).toBe(false);
  //   expect(identifierSourceSelectInput).toBe(undefined);
  // });
});

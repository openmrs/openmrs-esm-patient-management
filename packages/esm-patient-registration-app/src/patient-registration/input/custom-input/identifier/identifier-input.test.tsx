/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { ResourcesContext, type Resources } from '../../../../offline.resources';
import {
  PatientRegistrationContext,
  type PatientRegistrationContextProps,
} from '../../../patient-registration-context';
import type { AddressTemplate, FormValues, PatientIdentifierValue } from '../../../patient-registration.types';
import IdentifierInput from './identifier-input.component';
import userEvent from '@testing-library/user-event';

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
        uuid: '01af8526-cea4-4175-aa90-340acb411771',
        name: 'Generator 2 for OpenMRS ID',
        autoGenerationOption: {
          manualEntryEnabled: true,
          automaticGenerationEnabled: true,
        },
      },
    ],
    isPrimary: true,
    name: 'OpenMRS ID',
    required: true,
    uniquenessBehavior: 'UNIQUE' as const,
    uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
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

const mockContextValues: PatientRegistrationContextProps = {
  currentPhoto: '',
  inEditMode: false,
  identifierTypes: [],
  initialFormValues: {} as FormValues,
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldValue: jest.fn(),
  setInitialFormValues: jest.fn(),
  setFieldTouched: jest.fn(),
  validationSchema: null,
  values: {} as FormValues,
};

describe('identifier input', () => {
  const fieldName = 'openMrsId';
  const openmrsID = {
    identifierTypeUuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
    initialValue: '',
    identifierValue: '',
    identifierName: 'OpenMRS ID',
    selectedSource: {
      uuid: '01af8526-cea4-4175-aa90-340acb411771',
      name: 'Generator 2 for OpenMRS ID',
      autoGenerationOption: {
        manualEntryEnabled: true,
        automaticGenerationEnabled: true,
      },
    },
    autoGeneration: false,
    preferred: true,
    required: true,
  };

  const setupIdentifierInput = async (patientIdentifier: PatientIdentifierValue) => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <Form>
            <PatientRegistrationContext.Provider value={mockContextValues}>
              <IdentifierInput patientIdentifier={patientIdentifier} fieldName={fieldName} />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );

    let identifierLabel: HTMLParagraphElement;
    let identifierInput: HTMLInputElement;
    if (patientIdentifier.autoGeneration) {
      identifierLabel = screen.getByTestId('identifier-label');
      identifierInput = screen.getByTestId('identifier-input');
    } else {
      identifierLabel = screen.getByText(patientIdentifier.identifierName);
      identifierInput = screen.getByLabelText(patientIdentifier.identifierName);
    }
    return {
      identifierLabel,
      identifierInput,
    };
  };

  it('shows the identifier input', async () => {
    const { identifierInput } = await setupIdentifierInput(openmrsID);
    expect(identifierInput).toBeInTheDocument();
  });

  describe('Auto-generated identifier', () => {
    openmrsID.autoGeneration = true;

    it('hides the input when the identifier is auto-generated', async () => {
      const { identifierInput } = await setupIdentifierInput(openmrsID);
      expect(identifierInput.type).toBe('hidden');
    });

    it("displays 'Auto-Generated' when the indentifier has auto generation", async () => {
      const { identifierLabel, identifierInput } = await setupIdentifierInput(openmrsID);
      expect(identifierLabel.innerHTML).toBe('Auto-generated');
      expect(identifierInput.disabled).toBe(true);
    });

    it('displays an edit button when there is an initial value', async () => {
      // setup
      openmrsID.required = false;
      openmrsID.initialValue = '1002UU9';
      // replay
      await setupIdentifierInput(openmrsID);
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('displays a delete button when the identifier is not a default type', async () => {
      // setup
      openmrsID.required = false;
      // replay
      await setupIdentifierInput(openmrsID);
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });
});

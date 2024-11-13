/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../../../../config-schema';
import { ResourcesContext, type Resources } from '../../../../offline.resources';
import {
  PatientRegistrationContext,
  type PatientRegistrationContextProps,
} from '../../../patient-registration-context';
import type {
  AddressTemplate,
  FormValues,
  IdentifierSource,
  PatientIdentifierValue,
} from '../../../patient-registration.types';
import IdentifierInput from './identifier-input.component';
import userEvent from '@testing-library/user-event';

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
  addressTemplate: {} as AddressTemplate,
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

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

describe('identifier input', () => {
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
  });

  const fieldName = 'openMrsId';
  const openmrsID = {
    identifierTypeUuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
    initialValue: '',
    identifierName: 'OpenMRS ID',
    selectedSource: {
      uuid: '01af8526-cea4-4175-aa90-340acb411771',
      name: 'Generator 2 for OpenMRS ID',
      autoGenerationOption: {
        manualEntryEnabled: false,
        automaticGenerationEnabled: true,
      },
    } as IdentifierSource,
    autoGeneration: false,
    preferred: true,
    required: true,
  } as PatientIdentifierValue;

  const setupIdentifierInput = (patientIdentifier: PatientIdentifierValue, initialValues = {}) => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={initialValues} onSubmit={jest.fn()}>
          <Form>
            <PatientRegistrationContext.Provider value={mockContextValues}>
              <IdentifierInput patientIdentifier={patientIdentifier} fieldName={fieldName} />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
  };

  it('shows the identifier input', () => {
    openmrsID.autoGeneration = false;
    setupIdentifierInput(openmrsID as PatientIdentifierValue);
    expect(screen.getByLabelText(openmrsID.identifierName)).toBeInTheDocument();
  });

  it('displays an edit button when there is an initial value', async () => {
    // setup
    openmrsID.autoGeneration = false;
    openmrsID.required = false;
    openmrsID.initialValue = '1002UU9';
    openmrsID.identifierValue = '1002UU9';
    // replay
    setupIdentifierInput(openmrsID as PatientIdentifierValue);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('hides the edit button when the identifier is required', async () => {
    // setup
    openmrsID.autoGeneration = false;
    openmrsID.required = true;
    openmrsID.initialValue = '1002UU9';
    openmrsID.identifierValue = '1002UU9';
    // replay
    setupIdentifierInput(openmrsID);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('displays a delete button when the identifier is not a default type', () => {
    // setup
    openmrsID.required = false;
    // replay
    setupIdentifierInput(openmrsID);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  describe('auto-generated identifier', () => {
    it('hides the input when the identifier is auto-generated', () => {
      openmrsID.autoGeneration = true;
      setupIdentifierInput(openmrsID);
      expect(screen.getByTestId('identifier-input')).toHaveAttribute('type', 'hidden');
    });

    it("displays 'Auto-Generated' when the indentifier has auto generation", () => {
      openmrsID.autoGeneration = true;
      setupIdentifierInput(openmrsID);
      expect(screen.getByTestId('identifier-placeholder').innerHTML).toBe('Auto-generated');
      expect(screen.getByTestId('identifier-input')).toBeDisabled();
    });

    describe('manual entry allowed', () => {
      openmrsID.selectedSource = {
        autoGenerationOption: {
          manualEntryEnabled: true,
        },
      } as IdentifierSource;

      it('shows the edit button', () => {
        openmrsID.autoGeneration = true;
        setupIdentifierInput(openmrsID);
        expect(screen.getByText('Edit')).toBeInTheDocument();
      });

      describe('edit button clicked', () => {
        it('displays an empty input field', async () => {
          const user = userEvent.setup();
          openmrsID.autoGeneration = true;
          openmrsID.required = false;
          openmrsID.selectedSource = {
            autoGenerationOption: {
              manualEntryEnabled: true,
            },
          } as IdentifierSource;
          setupIdentifierInput(openmrsID);
          const editButton = screen.getByTestId('edit-button');
          await user.click(editButton);
          expect(screen.getByLabelText(new RegExp(`${openmrsID.identifierName}`))).toHaveValue('');
        });

        it('displays an input field with the identifier value if it exists', async () => {
          const user = userEvent.setup();
          openmrsID.autoGeneration = true;
          openmrsID.required = false;
          openmrsID.selectedSource = {
            autoGenerationOption: {
              manualEntryEnabled: true,
            },
          } as IdentifierSource;
          setupIdentifierInput(openmrsID, { identifiers: { [fieldName]: { identifierValue: '10001V' } } });
          const editButton = screen.getByTestId('edit-button');
          await user.click(editButton);
          expect(screen.getByLabelText(new RegExp(`${openmrsID.identifierName}`))).toHaveValue('10001V');
        });
      });
    });
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Identifiers } from './id-field.component';
import { Resources, ResourcesContext } from '../../../offline.resources';
import { Form, Formik } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useConfig } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(),
}));

describe('Identifiers', () => {
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
    addressTemplate: [],
    currentSession: {
      authenticated: true,
      sessionId: 'JSESSION',
      currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
    },
    relationshipTypes: [],
    identifierTypes: [...mockedIdentifierTypes],
  } as Resources;

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
  (useConfig as jest.Mock).mockImplementation(() => ({
    defaultPatientIdentifierTypes: ['OpenMRS ID'],
  }));

  it('should render loading skeleton when identifier types are loading', () => {
    render(
      <ResourcesContext.Provider value={[]}>
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
              <Identifiers />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render identifier inputs when identifier types are loaded', () => {
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
              <Identifiers />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );

    expect(screen.getByText('Identifiers')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Configure')).toBeEnabled();
  });

  it('should open identifier selection overlay when "Configure" button is clicked', () => {
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
              <Identifiers />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );

    const configureButton = screen.getByText('Configure');
    fireEvent.click(configureButton);

    expect(screen.getByRole('button', { name: 'Close overlay' })).toBeInTheDocument();
  });
  it('should close identifier selection overlay when "close overlay" button is clicked', () => {
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
              <Identifiers />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );

    const configureButton = screen.getByRole('button', { name: 'Configure' });
    fireEvent.click(configureButton);

    const closeBtn = screen.getByRole('button', { name: 'Close overlay' });
    fireEvent.click(closeBtn);
    expect(closeBtn).not.toBeInTheDocument();
  });
});

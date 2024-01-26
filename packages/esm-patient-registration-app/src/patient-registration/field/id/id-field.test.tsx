import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Identifiers } from './id-field.component';
import { type Resources, ResourcesContext } from '../../../offline.resources';
import { Form, Formik } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { openmrsID, mockedIdentifierTypes } from '__mocks__';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn().mockImplementation(() => ({
    defaultPatientIdentifierTypes: ['OpenMRS ID'],
  })),
}));

describe('Identifiers', () => {
  const mockResourcesContextValue = {
    addressTemplate: {},
    currentSession: {
      authenticated: true,
      sessionId: 'JSESSION',
      currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
    },
    relationshipTypes: [],
    identifierTypes: [...mockedIdentifierTypes],
  } as Resources;

  it('should render loading skeleton when identifier types are loading', () => {
    render(
      <ResourcesContext.Provider value={[]}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                setFieldValue: jest.fn(),
                initialFormValues: { identifiers: { ...mockedIdentifierTypes[0] } },
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
                initialFormValues: { identifiers: { ...mockedIdentifierTypes[0] } },
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
    const configureButton = screen.getByRole('button', { name: 'Configure' });
    expect(configureButton).toBeInTheDocument();
    expect(configureButton).toBeEnabled();
  });

  it('should open identifier selection overlay when "Configure" button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                setFieldValue: jest.fn(),
                initialFormValues: { identifiers: { ...mockedIdentifierTypes[0] } },
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
    await user.click(configureButton);

    expect(screen.getByRole('button', { name: 'Close overlay' })).toBeInTheDocument();
  });
});

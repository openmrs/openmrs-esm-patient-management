import React from 'react';
import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { type Resources, ResourcesContext } from '../../../offline.resources';
import { RelationshipsSection } from './relationships-section.component';

jest.mock('../../patient-registration.resource', () => ({
  fetchPerson: jest.fn().mockResolvedValue({
    data: {
      results: [
        { uuid: '42ae5ce0-d64b-11ea-9064-5adc43bbdd24', display: 'Person 1' },
        { uuid: '691eed12-c0f1-11e2-94be-8c13b969e334', display: 'Person 2' },
      ],
    },
  }),
}));

let mockResourcesContextValue = {
  addressTemplate: null,
  currentSession: {
    authenticated: true,
    sessionId: 'JSESSION',
    currentProvider: { uuid: '45ce6c2e-dd5a-11e6-9d9c-0242ac150002', identifier: 'PRO-123' },
  },
  identifierTypes: [],
  relationshipTypes: null,
} as Resources;

describe('RelationshipsSection', () => {
  it('renders a loader when relationshipTypes are not available', () => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <RelationshipsSection />
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );

    expect(screen.getByLabelText(/loading relationships section/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/add relationship/i)).not.toBeInTheDocument();
  });

  it('renders relationships when relationshipTypes are available', () => {
    const relationshipTypes = {
      results: [
        { aIsToB: 'Mother', bIsToA: 'Child', uuid: '42ae5ce0-d64b-11ea-9064-5adc43bbdd34' },
        { aIsToB: 'Father', bIsToA: 'Child', uuid: '52ae5ce0-d64b-11ea-9064-5adc43bbdd24' },
      ],
    };
    mockResourcesContextValue = {
      ...mockResourcesContextValue,
      relationshipTypes: relationshipTypes,
    };

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik
          initialValues={{
            relationships: [{ action: 'ADD', relatedPersonUuid: '11524ae7-3ef6-4ab6-aff6-804ffc58704a' }],
          }}
          onSubmit={null}>
          <Form>
            <PatientRegistrationContext.Provider
              value={{
                setFieldValue: jest.fn(),
                setInitialFormValues: jest.fn(),
              }}>
              <RelationshipsSection />
            </PatientRegistrationContext.Provider>
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );

    expect(screen.getByLabelText(/relationships section/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /relationship/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add relationship/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /full name/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /mother/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /father/i })).toBeInTheDocument();
    expect(screen.getAllByRole('option', { name: /child/i }).length).toEqual(2);
  });
});

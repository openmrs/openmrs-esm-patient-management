import React from 'react';
import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Resources, ResourcesContext } from '../../../offline.resources';
import { RelationshipsSection } from './relationships-section.component';

jest.mock('../../patient-registration.resource', () => ({
  fetchPerson: jest.fn().mockResolvedValue({
    data: {
      results: [
        { uuid: 'uuid1', display: 'Person 1' },
        { uuid: 'uuid2', display: 'Person 2' },
      ],
    },
  }),
}));

let mockResourcesContextValue = {
  addressTemplate: [],
  currentSession: {
    authenticated: true,
    sessionId: 'JSESSION',
    currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
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
    expect(screen.getByRole(/progressbar/i)).toBeInTheDocument();
    expect(screen.queryByText(/add relationship/i)).not.toBeInTheDocument();
  });

  it('renders relationships when relationshipTypes are available', () => {
    const relationshipTypes = {
      results: [
        { aIsToB: 'Mother', bIsToA: 'Child', uuid: 'uuid1' },
        { aIsToB: 'Father', bIsToA: 'Child', uuid: 'uuid2' },
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

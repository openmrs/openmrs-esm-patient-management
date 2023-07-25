import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RelationshipsSection } from './relationships-section.component';
import { Form, Formik } from 'formik';
import { Resources, ResourcesContext } from '../../../offline.resources';
import { RegistrationConfig } from '../../../config-schema';
import { PatientRegistrationContext } from '../../patient-registration-context';

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

let mockOpenmrsConfig: RegistrationConfig = {
  sections: ['demographics', 'contact'],
  sectionDefinitions: [
    { id: 'demographics', name: 'Demographics', fields: ['name', 'gender', 'dob'] },
    { id: 'contact', name: 'Contact Info', fields: ['address'] },
    { id: 'relationships', name: 'Relationships', fields: ['relationship'] },
  ],
  fieldDefinitions: [],
  fieldConfigurations: {
    name: {
      displayMiddleName: true,
      unidentifiedPatient: true,
      defaultUnknownGivenName: 'UNKNOWN',
      defaultUnknownFamilyName: 'UNKNOWN',
    },
    gender: [
      {
        value: 'Male',
        label: 'Male',
        id: 'male',
      },
    ],
    address: {
      useAddressHierarchy: {
        enabled: true,
        useQuickSearch: true,
        searchAddressByLevel: true,
      },
    },
  },
  concepts: {
    patientPhotoUuid: '736e8771-e501-4615-bfa7-570c03f4bef5',
  },
  links: {
    submitButton: '#',
  },
  defaultPatientIdentifierTypes: [],
  registrationObs: {
    encounterTypeUuid: null,
    encounterProviderRoleUuid: 'asdf',
    registrationFormUuid: null,
  },
};

describe('RelationshipsSection', () => {
  it('renders skeleton text when relationshipTypes are not available', () => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Formik initialValues={{}} onSubmit={null}>
          <Form>
            <RelationshipsSection />
          </Form>
        </Formik>
      </ResourcesContext.Provider>,
    );
    expect(screen.queryByText(/Add Relationship/i)).not.toBeInTheDocument();
  });

  it.skip('renders relationships when relationshipTypes are available', () => {
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
    jest.spyOn(React, 'useContext').mockReturnValue({ relationshipTypes });
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
    // expect(container.querySelectorAll('.relationship')).toHaveLength(0);
    screen.debug();
    expect(screen.getByText(/Add Relationship/i)).toBeInTheDocument();
  });
});

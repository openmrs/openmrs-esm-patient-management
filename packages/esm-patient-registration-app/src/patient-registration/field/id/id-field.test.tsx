import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { Form, Formik } from 'formik';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { Identifiers } from './id-field.component';
import { mockOpenmrsId, mockIdentifierTypes, mockPatient, mockSession } from '__mocks__';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { type Resources, ResourcesContext } from '../../../offline.resources';
import { PatientRegistrationContext, type PatientRegistrationContextProps } from '../../patient-registration-context';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

const mockResourcesContextValue = {
  addressTemplate: null,
  currentSession: mockSession.data,
  identifierTypes: [],
  relationshipTypes: [],
} as Resources;

const mockInitialFormValues = {
  additionalFamilyName: '',
  additionalGivenName: '',
  additionalMiddleName: '',
  addNameInLocalLanguage: false,
  address: {},
  birthdate: null,
  birthdateEstimated: false,
  deathCause: '',
  deathDate: '',
  familyName: 'Doe',
  gender: 'male',
  givenName: 'John',
  identifiers: mockOpenmrsId,
  isDead: false,
  middleName: 'Test',
  monthsEstimated: 0,
  patientUuid: mockPatient.uuid,
  relationships: [],
  telephoneNumber: '',
  yearsEstimated: 0,
};

const initialContextValues: PatientRegistrationContextProps = {
  currentPhoto: null,
  inEditMode: false,
  identifierTypes: [],
  initialFormValues: mockInitialFormValues,
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldValue: jest.fn(),
  setInitialFormValues: jest.fn(),
  validationSchema: null,
  values: mockInitialFormValues,
};

describe('Identifiers', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      defaultPatientIdentifierTypes: ['OpenMRS ID'],
    });
  });

  it('should render loading skeleton when identifier types are loading', () => {
    renderIdentifiers(initialContextValues);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render identifier inputs when identifier types are loaded', () => {
    mockResourcesContextValue.identifierTypes = mockIdentifierTypes;
    renderIdentifiers(initialContextValues);

    expect(screen.getByText('Identifiers')).toBeInTheDocument();
    const configureButton = screen.getByRole('button', { name: 'Configure' });
    expect(configureButton).toBeInTheDocument();
    expect(configureButton).toBeEnabled();
  });

  it('should open identifier selection overlay when "Configure" button is clicked', async () => {
    const user = userEvent.setup();
    mockResourcesContextValue.identifierTypes = mockIdentifierTypes;
    renderIdentifiers(initialContextValues);

    const configureButton = screen.getByRole('button', { name: 'Configure' });
    await user.click(configureButton);

    expect(screen.getByRole('button', { name: 'Close overlay' })).toBeInTheDocument();
  });
});

function renderIdentifiers(contextValues: PatientRegistrationContextProps) {
  render(
    <ResourcesContext.Provider value={mockResourcesContextValue}>
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <PatientRegistrationContext.Provider value={contextValues}>
            <Identifiers />
          </PatientRegistrationContext.Provider>
        </Form>
      </Formik>
    </ResourcesContext.Provider>,
  );
}

import React from 'react';
import { Form, Formik } from 'formik';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type AddressTemplate, type IdentifierSource } from '../../patient-registration.types';
import { mockIdentifierTypes, mockOpenmrsId, mockPatient, mockSession } from '__mocks__';
import { renderWithContext } from 'tools';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../../../config-schema';
import { type Resources } from '../../../offline.resources';
import {
  PatientRegistrationContextProvider,
  type PatientRegistrationContextProps,
} from '../../patient-registration-context';
import { Identifiers, setIdentifierSource } from './id-field.component';
import { ResourcesContextProvider } from '../../../resources-context';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

const mockResourcesContextValue = {
  addressTemplate: null as unknown as AddressTemplate,
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

const mockContextValues: PatientRegistrationContextProps = {
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
} as unknown as PatientRegistrationContextProps;

describe('Identifiers', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      defaultPatientIdentifierTypes: ['OpenMRS ID'],
    });
  });

  it('should render loading skeleton when identifier types are loading', () => {
    renderWithContext(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <PatientRegistrationContextProvider value={mockContextValues}>
            <Identifiers />
          </PatientRegistrationContextProvider>
        </Form>
      </Formik>,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render identifier inputs when identifier types are loaded', () => {
    mockResourcesContextValue.identifierTypes = mockIdentifierTypes;

    renderWithContext(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <PatientRegistrationContextProvider value={mockContextValues}>
            <Identifiers />
          </PatientRegistrationContextProvider>
        </Form>
      </Formik>,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    expect(screen.getByText('Identifiers')).toBeInTheDocument();
    const configureButton = screen.getByRole('button', { name: 'Configure' });
    expect(configureButton).toBeInTheDocument();
    expect(configureButton).toBeEnabled();
  });

  it('should open identifier selection overlay when "Configure" button is clicked', async () => {
    const user = userEvent.setup();
    mockResourcesContextValue.identifierTypes = mockIdentifierTypes;

    renderWithContext(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <PatientRegistrationContextProvider value={mockContextValues}>
            <Identifiers />
          </PatientRegistrationContextProvider>
        </Form>
      </Formik>,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    const configureButton = screen.getByRole('button', { name: 'Configure' });
    await user.click(configureButton);

    expect(screen.getByRole('button', { name: 'Close overlay' })).toBeInTheDocument();
  });
});

describe('setIdentifierSource', () => {
  describe('auto-generation', () => {
    it('should return auto-generated as the identifier value', () => {
      const identifierSource = { autoGenerationOption: { automaticGenerationEnabled: true } } as IdentifierSource;
      const { identifierValue } = setIdentifierSource(identifierSource, '', '');
      expect(identifierValue).toBe('auto-generated');
    });

    it('should return the identifier value when manual entry enabled', () => {
      const identifierSource = {
        autoGenerationOption: { automaticGenerationEnabled: true, manualEntryEnabled: true },
      } as IdentifierSource;
      const { identifierValue } = setIdentifierSource(identifierSource, '10001V', '');
      expect(identifierValue).toBe('10001V');
    });
  });
});

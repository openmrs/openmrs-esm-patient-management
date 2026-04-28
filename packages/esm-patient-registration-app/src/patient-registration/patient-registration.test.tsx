import React from 'react';
import userEvent from '@testing-library/user-event';
import { useParams } from 'react-router-dom';
import { fireEvent, screen, within } from '@testing-library/react';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  showSnackbar,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import type { AddressTemplate, Encounter, FormValues } from './patient-registration.types';
import { mockedAddressTemplate } from '__mocks__';
import { mockPatient, renderWithContext } from 'tools';
import { saveEncounter, savePatient } from './patient-registration.resource';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../config-schema';
import { FormManager } from './form-manager';
import { PatientRegistration } from './patient-registration.component';
import { useInitialFormValues } from './patient-registration-hooks';
import { ResourcesContextProvider } from '../resources-context';

const mockSaveEncounter = jest.mocked(saveEncounter);
const mockSavePatient = jest.mocked(savePatient);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);
const mockUsePatient = jest.mocked(usePatient);
const mockUseParams = jest.mocked(useParams);
const mockUseInitialFormValues = jest.mocked(useInitialFormValues);

jest.mock('./field/field.resource', () => ({
  useConcept: jest.fn().mockImplementation((uuid: string) => {
    let data;
    if (uuid === 'weight-uuid') {
      data = {
        uuid: 'weight-uuid',
        display: 'Weight (kg)',
        datatype: { display: 'Numeric', uuid: 'num' },
        answers: [],
        setMembers: [],
      };
    } else if (uuid === 'chief-complaint-uuid') {
      data = {
        uuid: 'chief-complaint-uuid',
        display: 'Chief Complaint',
        datatype: { display: 'Text', uuid: 'txt' },
        answers: [],
        setMembers: [],
      };
    } else if (uuid === 'nationality-uuid') {
      data = {
        uuid: 'nationality-uuid',
        display: 'Nationality',
        datatype: { display: 'Coded', uuid: 'cdd' },
        answers: [
          { display: 'USA', uuid: 'usa' },
          { display: 'Mexico', uuid: 'mex' },
        ],
        setMembers: [],
      };
    }
    return {
      data: data ?? null,
      isLoading: !data,
    };
  }),
  useConceptAnswers: jest.fn().mockImplementation((uuid: string) => {
    if (uuid === 'nationality-uuid') {
      return {
        data: [
          { display: 'USA', uuid: 'usa' },
          { display: 'Mexico', uuid: 'mex' },
        ],
        isLoading: false,
      };
    } else if (uuid === 'other-countries-uuid') {
      return {
        data: [
          { display: 'Kenya', uuid: 'ke' },
          { display: 'Uganda', uuid: 'ug' },
        ],
        isLoading: false,
      };
    }
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'openmrs/spa/patient-registration',
  }),
  useHistory: () => [],
  useParams: jest.fn().mockReturnValue({ patientUuid: undefined }),
}));

jest.mock('./patient-registration.resource', () => ({
  ...jest.requireActual('./patient-registration.resource'),
  saveEncounter: jest.fn(),
  savePatient: jest.fn(),
}));

jest.mock('./patient-registration-hooks', () => {
  const actual = jest.requireActual('./patient-registration-hooks');
  const defaultInitialFormValues = {
    additionalFamilyName: '',
    additionalGivenName: '',
    additionalMiddleName: '',
    addNameInLocalLanguage: false,
    address: {},
    birthdate: '',
    birthdateEstimated: false,
    deathCause: '',
    deathDate: undefined,
    deathTime: undefined,
    deathTimeFormat: 'AM',
    familyName: '',
    gender: '',
    givenName: '',
    identifiers: {},
    isDead: false,
    middleName: '',
    monthsEstimated: 0,
    nonCodedCauseOfDeath: '',
    patientUuid: 'new-patient-uuid',
    relationships: [],
    telephoneNumber: '',
    yearsEstimated: 0,
  } as FormValues;

  return {
    ...actual,
    useInitialFormValues: jest.fn().mockReturnValue([defaultInitialFormValues, jest.fn()]),
    useInitialAddressFieldValues: jest.fn().mockReturnValue([{}, jest.fn()]),
    usePatientUuidMap: jest.fn().mockReturnValue([{}, jest.fn()]),
  };
});

const mockResourcesContextValue = {
  addressTemplate: mockedAddressTemplate as AddressTemplate,
  currentSession: {
    authenticated: true,
    sessionId: 'JSESSION',
    currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
  },
  relationshipTypes: { results: [] },
  identifierTypes: [],
};

const mockOpenmrsConfig: RegistrationConfig = {
  sections: ['demographics', 'contact'],
  sectionDefinitions: [
    { id: 'demographics', name: 'Demographics', fields: ['name', 'gender', 'dob'] },
    { id: 'contact', name: 'Contact Info', fields: ['address'] },
    { id: 'relationships', name: 'Relationships', fields: ['relationship'] },
  ],
  fieldDefinitions: [],
  fieldConfigurations: {
    phone: {
      personAttributeUuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
    },
    dateOfBirth: {
      allowEstimatedDateOfBirth: true,
      useEstimatedDateOfBirth: {
        enabled: true,
        dayOfMonth: new Date().getDate(),
        month: new Date().getMonth(),
      },
    },
    name: {
      displayMiddleName: true,
      allowUnidentifiedPatients: true,
      defaultUnknownGivenName: 'UNKNOWN',
      defaultUnknownFamilyName: 'UNKNOWN',
      displayReverseFieldOrder: false,
      displayCapturePhoto: true,
    },
    gender: [
      {
        value: 'male',
        label: 'Male',
      },
      {
        value: 'female',
        label: 'Female',
      },
    ],
    address: {
      useAddressHierarchy: {
        enabled: true,
        useQuickSearch: true,
        searchAddressByLevel: true,
      },
    },
    causeOfDeath: {
      conceptUuid: 'cause-of-death-concept-uuid',
    },
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
  freeTextFieldConceptUuid: '',
};
const configWithObs = JSON.parse(JSON.stringify(mockOpenmrsConfig));

configWithObs.fieldDefinitions = [
  {
    id: 'weight',
    type: 'obs',
    label: null,
    uuid: 'weight-uuid',
    placeholder: '',
    validation: { required: false, matches: null },
    answerConceptSetUuid: null,
    customConceptAnswers: [],
  },
  {
    id: 'chief complaint',
    type: 'obs',
    label: null,
    uuid: 'chief-complaint-uuid',
    placeholder: '',
    validation: { required: false, matches: null },
    answerConceptSetUuid: null,
    customConceptAnswers: [],
  },
  {
    id: 'nationality',
    type: 'obs',
    label: null,
    uuid: 'nationality-uuid',
    placeholder: '',
    validation: { required: false, matches: null },
    answerConceptSetUuid: null,
    customConceptAnswers: [],
  },
];
configWithObs.sectionDefinitions?.push({
  id: 'custom',
  name: 'Custom',
  fields: ['weight', 'chief complaint', 'nationality'],
});
configWithObs.sections.push('custom');
configWithObs.registrationObs.encounterTypeUuid = 'reg-enc-uuid';

const fillRequiredFields = async () => {
  const user = userEvent.setup();

  const demographicsSection = await screen.findByLabelText('Demographics Section');
  const givenNameInput = within(demographicsSection).getByLabelText(/first/i) as HTMLInputElement;
  const familyNameInput = within(demographicsSection).getByLabelText(/family/i) as HTMLInputElement;

  await user.type(givenNameInput, 'Paul');
  await user.type(familyNameInput, 'Gaihre');

  // Set birthdate using the date picker's public API
  let dateOfBirthInput: HTMLInputElement;
  const birthDateString = '1993-08-02';

  try {
    // Approach 1: Find as textbox (like appointments test)
    dateOfBirthInput = within(demographicsSection).getByRole('textbox', { name: /date of birth/i }) as HTMLInputElement;
  } catch (e) {
    // Approach 2: Find by label
    dateOfBirthInput = within(demographicsSection).getByLabelText(/date of birth/i) as HTMLInputElement;
  }

  fireEvent.change(dateOfBirthInput, { target: { value: birthDateString } });
  fireEvent.blur(dateOfBirthInput);

  const genderInput = within(demographicsSection).getByLabelText(/Male/) as HTMLSelectElement;
  await user.click(genderInput);
};

describe('Registering a new patient', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      ...mockOpenmrsConfig,
    });
    mockSavePatient.mockResolvedValue({ data: { uuid: 'new-pt-uuid' }, ok: true } as any);
  });

  it('should render all the required fields and sections', async () => {
    renderWithContext(
      <PatientRegistration isOffline={false} savePatientForm={jest.fn()} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await screen.findByRole('heading', { name: /create new patient/i });

    const demographicSection = screen.getByRole('region', { name: /demographics section/i });
    const contactSection = screen.getByRole('region', { name: /contact info section/i });

    expect(demographicSection).toBeInTheDocument();
    expect(contactSection).toBeInTheDocument();
    expect(screen.getByText(/jump to/i)).toBeInTheDocument();
    expect(within(demographicSection).getByLabelText(/first name/i)).toBeInTheDocument();
    expect(within(demographicSection).getByLabelText(/middle name \(optional\)/i)).toBeInTheDocument();
    expect(within(demographicSection).getByLabelText(/family name/i)).toBeInTheDocument();
    const dateOfBirthInput = within(demographicSection).getByLabelText(/date of birth/i);
    expect(dateOfBirthInput).toBeInTheDocument();
    expect(within(demographicSection).getByRole('radio', { name: /^male$/i })).toBeInTheDocument();
    expect(within(demographicSection).getByRole('radio', { name: /^female$/i })).toBeInTheDocument();
    expect(within(demographicSection).getByText(/date of birth known\?/i)).toBeInTheDocument();

    expect(within(contactSection).getByRole('heading', { name: /address/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /register patient/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('saves the patient without extra info', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await fillRequiredFields();
    const registerButton = await screen.findByRole('button', { name: /register patient/i });
    await user.click(registerButton);
    expect(mockSavePatient).toHaveBeenCalledWith(
      expect.objectContaining({
        identifiers: [], // Note: Identifier story may need test data update when complete
        person: {
          addresses: expect.arrayContaining([expect.any(Object)]),
          attributes: [],
          birthdate: '1993-8-2',
          birthdateEstimated: false,
          gender: expect.stringMatching(/^M$/),
          names: [{ givenName: 'Paul', middleName: '', familyName: 'Gaihre', preferred: true, uuid: undefined }],
          dead: false,
          uuid: expect.anything(),
        },
        uuid: expect.anything(),
      }),
      undefined,
    );
  });

  it('should not save the patient if validation fails', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = jest.fn();

    renderWithContext(
      <PatientRegistration isOffline={false} savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await screen.findByRole('heading', { name: /create new patient/i });
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    expect(mockSavePatientForm).not.toHaveBeenCalled();
  });

  it('renders and saves registration obs', async () => {
    const user = userEvent.setup();

    mockSaveEncounter.mockResolvedValue({} as unknown as FetchResponse);
    mockUseConfig.mockReturnValue(configWithObs);

    renderWithContext(
      <PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await fillRequiredFields();
    const customSection = screen.getByLabelText('Custom Section');
    const weight = within(customSection).getByLabelText('Weight (kg) (optional)');
    await user.type(weight, '50');
    const complaint = within(customSection).getByLabelText('Chief Complaint (optional)');
    await user.type(complaint, 'sad');
    const nationality = within(customSection).getByLabelText('Nationality');
    await user.selectOptions(nationality, 'USA');

    const registerButton = await screen.findByRole('button', { name: /register patient/i });
    await user.click(registerButton);

    expect(mockSavePatient).toHaveBeenCalled();

    expect(mockSaveEncounter).toHaveBeenCalledWith(
      expect.objectContaining<Partial<Encounter>>({
        encounterType: 'reg-enc-uuid',
        patient: 'new-pt-uuid',
        obs: [
          { concept: 'weight-uuid', value: 50 },
          { concept: 'chief-complaint-uuid', value: 'sad' },
          { concept: 'nationality-uuid', value: 'usa' },
        ],
      }),
    );
  });

  it('retries saving registration obs after a failed attempt', async () => {
    const user = userEvent.setup();

    mockUseConfig.mockReturnValue(configWithObs);

    renderWithContext(
      <PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await fillRequiredFields();
    const customSection = screen.getByLabelText('Custom Section');
    const weight = within(customSection).getByLabelText('Weight (kg) (optional)');
    await user.type(weight, '-999');

    mockSaveEncounter.mockRejectedValue({ status: 400, responseBody: { error: { message: 'an error message' } } });

    const registerPatientButton = await screen.findByRole('button', { name: /register patient/i });

    await user.click(registerPatientButton);

    expect(mockSavePatient).toHaveBeenCalledTimes(1);
    expect(mockSaveEncounter).toHaveBeenCalledTimes(1);

    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ subtitle: 'an error message' }));
    mockSaveEncounter.mockResolvedValue({} as FetchResponse);

    await user.click(registerPatientButton);
    expect(mockSavePatient).toHaveBeenCalledTimes(2);
    expect(mockSaveEncounter).toHaveBeenCalledTimes(2);

    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
  });
});

describe('Updating an existing patient record', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      ...mockOpenmrsConfig,
    });
    mockUsePatient.mockImplementation(() => {
      return {
        error: null,
        isLoading: false,
        patient: mockPatient,
        patientUuid: mockPatient.id,
      };
    });
    mockSavePatient.mockResolvedValue({ data: { uuid: 'new-pt-uuid' }, ok: true } as any);
    mockUseParams.mockReturnValue({ patientUuid: mockPatient.id });
  });

  it('edits patient demographics', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = jest.fn();

    mockUseInitialFormValues.mockReturnValue([
      {
        additionalFamilyName: '',
        additionalGivenName: '',
        additionalMiddleName: '',
        addNameInLocalLanguage: false,
        address: {},
        birthdate: mockPatient.birthDate,
        birthdateEstimated: false,
        deathCause: '',
        deathDate: undefined,
        deathTime: undefined,
        deathTimeFormat: 'AM',
        familyName: mockPatient.name[0].family,
        gender: mockPatient.gender,
        givenName: mockPatient.name[0].given[0],
        identifiers: {
          openMrsId: {
            autoGeneration: false,
            identifierName: 'OpenMRS ID',
            identifierTypeUuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
            identifierUuid: '1f0ad7a1-430f-4397-b571-59ea654a52db',
            identifierValue: '100GEJ',
            initialValue: '100GEJ',
            preferred: true,
            required: true,
            selectedSource: null,
          },
          idCard: {
            autoGeneration: false,
            identifierName: 'ID Card',
            identifierTypeUuid: 'b4143563-16cd-4439-b288-f83d61670fc8',
            identifierUuid: '346d09b1-8509-43c6-9697-3b4d1ce06ad6',
            identifierValue: '1234567890',
            initialValue: '1234567890',
            preferred: false,
            required: false,
            selectedSource: null,
          },
        },
        isDead: false,
        middleName: '',
        monthsEstimated: 0,
        nonCodedCauseOfDeath: '',
        patientUuid: mockPatient.id,
        relationships: [],
        telephoneNumber: '',
        yearsEstimated: 0,
      } as FormValues,
      jest.fn(),
    ]);

    renderWithContext(
      <PatientRegistration isOffline={false} savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await screen.findByRole('heading', { name: /edit patient details/i });

    expect(screen.queryByRole('button', { name: /register patient/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update patient/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/first name/i)).toHaveValue(mockPatient.name[0].given[0]);
    expect(screen.getByLabelText(/family name/i)).toHaveValue(mockPatient.name[0].family);
    expect(
      screen.getByRole('radio', {
        name: /^male$/i,
      }),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', {
        name: /^female$/i,
      }),
    ).not.toBeChecked();
    expect(screen.getAllByRole('tab', { name: /yes/i })).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: /update patient/i }));

    expect(mockSavePatientForm).toHaveBeenCalledWith(
      false,
      {
        addNameInLocalLanguage: false,
        additionalFamilyName: '',
        additionalGivenName: '',
        additionalMiddleName: '',
        address: {
          country: 'កម្ពុជា (Cambodia)',
        },
        birthdate: '1972-04-04',
        birthdateEstimated: false,
        deathCause: '',
        nonCodedCauseOfDeath: '',
        deathDate: undefined,
        deathTime: undefined,
        deathTimeFormat: 'AM',
        familyName: 'Wilson',
        gender: 'male',
        givenName: 'John',
        identifiers: {
          idCard: {
            autoGeneration: false,
            identifierName: 'ID Card',
            identifierTypeUuid: 'b4143563-16cd-4439-b288-f83d61670fc8',
            identifierUuid: '346d09b1-8509-43c6-9697-3b4d1ce06ad6',
            identifierValue: '1234567890',
            initialValue: '1234567890',
            preferred: false,
            required: false,
            selectedSource: null,
          },
          openMrsId: {
            autoGeneration: false,
            identifierName: 'OpenMRS ID',
            identifierTypeUuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
            identifierUuid: '1f0ad7a1-430f-4397-b571-59ea654a52db',
            identifierValue: '100GEJ',
            initialValue: '100GEJ',
            preferred: true,
            required: true,
            selectedSource: null,
          },
        },
        isDead: false,
        middleName: '',
        monthsEstimated: 0,
        patientUuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
        relationships: [],
        telephoneNumber: '',
        unidentifiedPatient: undefined,
        yearsEstimated: 0,
      },
      expect.anything(),
      expect.anything(),
      null,
      undefined,
      expect.anything(),
      expect.anything(),
      expect.anything(),
      { patientSaved: false },
      expect.anything(),
    );
  });
});

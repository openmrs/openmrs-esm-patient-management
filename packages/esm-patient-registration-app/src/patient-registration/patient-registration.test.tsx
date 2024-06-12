import React from 'react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar, useConfig, usePatient } from '@openmrs/esm-framework';
import type { AddressTemplate, Encounter } from './patient-registration.types';
import { type RegistrationConfig } from '../config-schema';
import { FormManager } from './form-manager';
import { ResourcesContext } from '../offline.resources';
import { PatientRegistration } from './patient-registration.component';
import { saveEncounter, savePatient } from './patient-registration.resource';
import { mockedAddressTemplate } from '__mocks__';
import { mockPatient } from 'tools';

const mockedUseConfig = useConfig as jest.Mock;
const mockedUsePatient = usePatient as jest.Mock;
const mockedSaveEncounter = saveEncounter as jest.Mock;
const mockedSavePatient = savePatient as jest.Mock;
const mockedShowSnackbar = showSnackbar as jest.Mock;

jest.mock('./field/field.resource', () => ({
  useConcept: jest.fn().mockImplementation((uuid: string) => {
    let data;
    if (uuid == 'weight-uuid') {
      data = {
        uuid: 'weight-uuid',
        display: 'Weight (kg)',
        datatype: { display: 'Numeric', uuid: 'num' },
        answers: [],
        setMembers: [],
      };
    } else if (uuid == 'chief-complaint-uuid') {
      data = {
        uuid: 'chief-complaint-uuid',
        display: 'Chief Complaint',
        datatype: { display: 'Text', uuid: 'txt' },
        answers: [],
        setMembers: [],
      };
    } else if (uuid == 'nationality-uuid') {
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
    if (uuid == 'nationality-uuid') {
      return {
        data: [
          { display: 'USA', uuid: 'usa' },
          { display: 'Mexico', uuid: 'mex' },
        ],
        isLoading: false,
      };
    } else if (uuid == 'other-countries-uuid') {
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
  ...(jest.requireActual('react-router-dom') as any),
  useLocation: () => ({
    pathname: 'openmrs/spa/patient-registration',
  }),
  useHistory: () => [],
  useParams: jest.fn().mockReturnValue({ patientUuid: undefined }),
}));

jest.mock('./patient-registration.resource', () => {
  const originalModule = jest.requireActual('./patient-registration.resource');

  return {
    ...originalModule,
    saveEncounter: jest.fn(),
    savePatient: jest.fn(),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    validator: jest.fn(),
    getLocale: jest.fn().mockReturnValue('en'),
  };
});

const mockResourcesContextValue = {
  addressTemplate: mockedAddressTemplate as AddressTemplate,
  currentSession: {
    authenticated: true,
    sessionId: 'JSESSION',
    currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
  },
  relationshipTypes: [],
  identifierTypes: [],
};

let mockOpenmrsConfig: RegistrationConfig = {
  sections: ['demographics', 'contact'],
  sectionDefinitions: [
    { id: 'demographics', name: 'Demographics', fields: ['name', 'gender', 'dob'] },
    { id: 'contact', name: 'Contact Info', fields: ['address'] },
    { id: 'relationships', name: 'Relationships', fields: ['relationship'] },
  ],
  fieldDefinitions: [],
  fieldConfigurations: {
    dateOfBirth: {
      allowEstimatedDateOfBirth: true,
      useEstimatedDateOfBirth: {
        enabled: true,
        dayOfMonth: new Date().getDay(),
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

const path = `/patient/:patientUuid/edit`;

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
  const dateOfBirthInput = within(demographicsSection).getByLabelText(/date of birth/i) as HTMLInputElement;
  const genderInput = within(demographicsSection).getByLabelText(/Male/) as HTMLSelectElement;

  await user.type(givenNameInput, 'Paul');
  await user.type(familyNameInput, 'Gaihre');
  await user.clear(dateOfBirthInput);
  await user.type(dateOfBirthInput, '02/08/1993');
  user.click(genderInput);
};

function Wrapper({ children }) {
  return (
    <ResourcesContext.Provider value={mockResourcesContextValue}>
      <Router>{children}</Router>
    </ResourcesContext.Provider>
  );
}

describe('Registering a new patient', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue(mockOpenmrsConfig);
    mockedSavePatient.mockReturnValue({ data: { uuid: 'new-pt-uuid' }, ok: true });
    mockedSaveEncounter.mockClear();
    mockedShowSnackbar.mockClear();
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PatientRegistration isOffline={false} savePatientForm={jest.fn()} />, { wrapper: Wrapper });
  });

  it('has the expected sections', async () => {
    render(<PatientRegistration isOffline={false} savePatientForm={jest.fn()} />, { wrapper: Wrapper });

    expect(screen.getByLabelText(/Demographics Section/)).not.toBeNull();
    expect(screen.getByLabelText(/Contact Info Section/)).not.toBeNull();
  });

  it('saves the patient without extra info', async () => {
    const user = userEvent.setup();

    render(<PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />, {
      wrapper: Wrapper,
    });

    await fillRequiredFields();
    await user.click(await screen.findByText(/Register Patient/i));
    expect(mockedSavePatient).toHaveBeenCalledWith(
      expect.objectContaining({
        identifiers: [], //TODO when the identifer story is finished: { identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' },
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

    const mockedSavePatientForm = jest.fn();
    render(<PatientRegistration isOffline={false} savePatientForm={mockedSavePatientForm} />, { wrapper: Wrapper });

    const givenNameInput = (await screen.findByLabelText('First Name')) as HTMLInputElement;

    await user.type(givenNameInput, '5');
    await user.click(screen.getByText(/Register Patient/i));

    expect(mockedSavePatientForm).not.toHaveBeenCalled();
  });

  it('renders and saves registration obs', async () => {
    const user = userEvent.setup();

    mockedSaveEncounter.mockResolvedValue({});
    mockedUseConfig.mockReturnValue(configWithObs);

    render(<PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />, {
      wrapper: Wrapper,
    });

    await fillRequiredFields();
    const customSection = screen.getByLabelText('Custom Section');
    const weight = within(customSection).getByLabelText('Weight (kg) (optional)');
    await user.type(weight, '50');
    const complaint = within(customSection).getByLabelText('Chief Complaint (optional)');
    await user.type(complaint, 'sad');
    const nationality = within(customSection).getByLabelText('Nationality');
    await user.selectOptions(nationality, 'USA');

    await user.click(screen.getByText(/Register Patient/i));

    expect(mockedSavePatient).toHaveBeenCalled();

    expect(mockedSaveEncounter).toHaveBeenCalledWith(
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

    mockedUseConfig.mockReturnValue(configWithObs);

    render(<PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />, {
      wrapper: Wrapper,
    });

    await fillRequiredFields();
    const customSection = screen.getByLabelText('Custom Section');
    const weight = within(customSection).getByLabelText('Weight (kg) (optional)');
    await user.type(weight, '-999');

    mockedSaveEncounter.mockRejectedValue({ status: 400, responseBody: { error: { message: 'an error message' } } });

    const registerPatientButton = screen.getByText(/Register Patient/i);

    await user.click(registerPatientButton);

    expect(mockedSavePatient).toHaveBeenCalledTimes(1);
    expect(mockedSaveEncounter).toHaveBeenCalledTimes(1);

    expect(mockedShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ subtitle: 'an error message' })),
      mockedSaveEncounter.mockResolvedValue({});

    await user.click(registerPatientButton);
    expect(mockedSavePatient).toHaveBeenCalledTimes(2);
    expect(mockedSaveEncounter).toHaveBeenCalledTimes(2);

    expect(mockedShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
  });
});

describe('Updating an existing patient record', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue(mockOpenmrsConfig);
    mockedSavePatient.mockReturnValue({ data: { uuid: 'new-pt-uuid' }, ok: true });
    mockedSaveEncounter.mockClear();
    mockedShowSnackbar.mockClear();
    jest.clearAllMocks();
  });

  it('edits patient demographics', async () => {
    const user = userEvent.setup();

    mockedSavePatient.mockResolvedValue({});

    const mockedUseParams = useParams as jest.Mock;

    mockedUseParams.mockReturnValue({ patientUuid: mockPatient.id });

    mockedUsePatient.mockReturnValue({
      isLoading: false,
      patient: mockPatient,
      patientUuid: mockPatient.id,
      error: null,
    });

    render(<PatientRegistration isOffline={false} savePatientForm={mockedSavePatient} />, { wrapper: Wrapper });

    const givenNameInput: HTMLInputElement = screen.getByLabelText(/First Name/);
    const familyNameInput: HTMLInputElement = screen.getByLabelText(/Family Name/);
    const middleNameInput: HTMLInputElement = screen.getByLabelText(/Middle Name/);
    const dateOfBirthInput: HTMLInputElement = screen.getByLabelText('Date of Birth');
    const genderInput: HTMLInputElement = screen.getByLabelText(/Male/);

    // assert initial values
    expect(givenNameInput.value).toBe('John');
    expect(familyNameInput.value).toBe('Wilson');
    expect(middleNameInput.value).toBeFalsy();
    expect(dateOfBirthInput.value).toBe('04/04/1972');
    expect(genderInput.value).toBe('male');

    // do some edits
    await user.clear(givenNameInput);
    await user.clear(middleNameInput);
    await user.clear(familyNameInput);
    await user.type(givenNameInput, 'Eric');
    await user.type(middleNameInput, 'Johnson');
    await user.type(familyNameInput, 'Smith');
    await user.click(screen.getByText(/Update patient/i));

    expect(mockedSavePatient).toHaveBeenCalledWith(
      false,
      {
        '0': {
          oldIdentificationNumber: '100732HE',
        },
        '1': {
          openMrsId: '100GEJ',
        },
        addNameInLocalLanguage: undefined,
        additionalFamilyName: '',
        additionalGivenName: '',
        additionalMiddleName: '',
        address: {},
        birthdate: new Date('1972-04-04T00:00:00.000Z'),
        birthdateEstimated: false,
        deathCause: '',
        deathDate: '',
        familyName: 'Smith',
        gender: expect.stringMatching(/male/i),
        givenName: 'Eric',
        identifiers: {},
        isDead: false,
        middleName: 'Johnson',
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

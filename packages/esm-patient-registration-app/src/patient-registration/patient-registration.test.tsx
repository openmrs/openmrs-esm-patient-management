import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showToast, useConfig, usePatient } from '@openmrs/esm-framework';
import FormManager from './form-manager';
import { saveEncounter, savePatient } from './patient-registration.resource';
import { Encounter } from './patient-registration-types';
import { Resources, ResourcesContext } from '../offline.resources';
import { PatientRegistration } from './patient-registration.component';
import { RegistrationConfig } from '../config-schema';
import { mockedAddressTemplate } from './field/address/tests/mocks';
import { mockPatient } from '../../../../tools/test-helpers';

const mockedUseConfig = useConfig as jest.Mock;
const mockedUsePatient = usePatient as jest.Mock;
const mockedSaveEncounter = saveEncounter as jest.Mock;
const mockedSavePatient = savePatient as jest.Mock;
const mockedShowToast = showToast as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    validator: jest.fn(),
  };
});

// Mock field.resource using the manual mock (in __mocks__)
jest.mock('./field/field.resource');

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useLocation: () => ({
    pathname: 'openmrs/spa/patient-registration',
  }),
  useHistory: () => [],
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
  };
});

const mockResourcesContextValue = {
  addressTemplate: mockedAddressTemplate,
  currentSession: {
    authenticated: true,
    sessionId: 'JSESSION',
    currentProvider: { uuid: 'provider-uuid', identifier: 'PRO-123' },
  },
  relationshipTypes: [],
  identifierTypes: [],
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
      allowUnidentifiedPatients: true,
      defaultUnknownGivenName: 'UNKNOWN',
      defaultUnknownFamilyName: 'UNKNOWN',
      displayReverseFieldOrder: false,
      displayCapturePhoto: true,
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
  },
  {
    id: 'chief complaint',
    type: 'obs',
    label: null,
    uuid: 'chief-complaint-uuid',
    placeholder: '',
    validation: { required: false, matches: null },
    answerConceptSetUuid: null,
  },
  {
    id: 'nationality',
    type: 'obs',
    label: null,
    uuid: 'nationality-uuid',
    placeholder: '',
    validation: { required: false, matches: null },
    answerConceptSetUuid: null,
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
  fireEvent.blur(dateOfBirthInput);
  fireEvent.click(genderInput);
};

describe('patient registration', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue(mockOpenmrsConfig);
    mockedSavePatient.mockReturnValue({ data: { uuid: 'new-pt-uuid' }, ok: true });
    mockedSaveEncounter.mockClear();
    mockedShowToast.mockClear();
  });

  it.only('renders without crashing', () => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Router>
          <PatientRegistration isOffline={false} savePatientForm={jest.fn()} />
        </Router>
        ,
      </ResourcesContext.Provider>,
    );
  });

  it('has the expected sections', async () => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Router>
          <PatientRegistration isOffline={false} savePatientForm={jest.fn()} />
        </Router>
      </ResourcesContext.Provider>,
    );
    await waitFor(() => expect(screen.getByLabelText(/Demographics Section/)).not.toBeNull());
    expect(screen.getByLabelText(/Contact Info Section/)).not.toBeNull();
  });

  it('saves the patient without extra info', async () => {
    const user = userEvent.setup();

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Router>
          <PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />
        </Router>
      </ResourcesContext.Provider>,
    );

    await fillRequiredFields();
    await user.click(await screen.findByText('Register Patient'));
    await waitFor(() => {
      expect(mockedSavePatient).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          identifiers: [], //TODO when the identifer story is finished: { identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' }
          // identifiers: [{ identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' }],
          person: {
            addresses: [{}],
            attributes: [],
            birthdate: '1993-8-2',
            birthdateEstimated: false,
            gender: 'M',
            names: [{ givenName: 'Paul', middleName: '', familyName: 'Gaihre', preferred: true, uuid: undefined }],
            dead: false,
            uuid: expect.anything(),
          },
          uuid: expect.anything(),
        }),
        undefined,
      );
    });
  });

  it('should not save the patient if validation fails', async () => {
    const user = userEvent.setup();

    const mockedSavePatientForm = jest.fn();
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Router>
          <PatientRegistration isOffline={false} savePatientForm={mockedSavePatientForm} />
        </Router>
      </ResourcesContext.Provider>,
    );

    const givenNameInput = (await screen.findByLabelText('First Name')) as HTMLInputElement;

    await user.type(givenNameInput, '');
    await user.click(screen.getByText('Register Patient'));

    expect(mockedSavePatientForm).not.toHaveBeenCalled();
  });

  it.skip('edits patient demographics', async () => {
    const user = userEvent.setup();

    mockedSavePatient.mockResolvedValue({});

    mockedUsePatient.mockReturnValueOnce({
      isLoading: false,
      patient: mockPatient,
      patientUuid: mockPatient.id,
      error: null,
    });

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Router>
          <PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />
        </Router>
      </ResourcesContext.Provider>,
    );

    const givenNameInput = screen.getByLabelText(/First Name/) as HTMLInputElement;
    const familyNameInput = screen.getByLabelText(/Family Name/) as HTMLInputElement;
    const middleNameInput = screen.getByLabelText(/Middle Name/) as HTMLInputElement;
    const dateOfBirthInput = screen.getByLabelText('Date of Birth') as HTMLInputElement;
    const address1 = screen.getByLabelText('Location.address1') as HTMLInputElement;

    // assert initial values
    expect(givenNameInput.value).toBe('John');
    expect(familyNameInput.value).toBe('Wilson');
    expect(middleNameInput.value).toBeFalsy();
    expect(dateOfBirthInput.value).toBe('04/04/1972');

    // do some edits
    await user.clear(givenNameInput);
    await user.clear(middleNameInput);
    await user.clear(familyNameInput);
    await user.type(givenNameInput, 'Eric');
    await user.type(middleNameInput, 'Johnson');
    await user.type(familyNameInput, 'Smith');
    await user.type(address1, 'Bom Jesus Street');
    await user.click(screen.getByText('Update Patient'));

    expect(mockedSavePatient).toHaveBeenCalledWith(
      expect.anything(),
      {
        uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
        identifiers: [
          {
            uuid: '1f0ad7a1-430f-4397-b571-59ea654a52db',
            identifier: '100GEJ',
            identifierType: 'e5af9a9c-ff9d-486d-900c-5fbf66a5ba3c',
            preferred: true,
          },
          {
            uuid: '1f0ad7a1-430f-4397-b571-59ea654a52db',
            identifier: '100732HE',
            identifierType: '3ff0063c-dd45-4d98-8af4-0c094f26166c',
            preferred: false,
          },
        ],
        person: {
          addresses: [
            {
              address1: 'Bom Jesus Street',
              address2: '',
              cityVillage: 'City0351',
              country: 'Country0351',
              postalCode: '60351',
              stateProvince: 'State0351tested',
            },
          ],
          attributes: [],
          birthdate: new Date('1972-04-04'),
          birthdateEstimated: false,
          gender: 'M',
          names: [
            {
              uuid: 'efdb246f-4142-4c12-a27a-9be60b9592e9',
              givenName: 'Eric',
              middleName: 'Johnson',
              familyName: 'Smith',
              preferred: true,
            },
          ],
          dead: false,
          uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
        },
      },
      '8673ee4f-e2ab-4077-ba55-4980f408773e',
    );
  });

  it('renders and saves registration obs', async () => {
    const user = userEvent.setup();

    mockedSaveEncounter.mockResolvedValue({});
    mockedUseConfig.mockReturnValue(configWithObs);

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Router>
          <PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />
        </Router>
      </ResourcesContext.Provider>,
    );

    await fillRequiredFields();
    const customSection = screen.getByLabelText('Custom Section');
    const weight = within(customSection).getByLabelText('Weight (kg)');
    await user.type(weight, '50');
    const complaint = within(customSection).getByLabelText('Chief Complaint');
    await user.type(complaint, 'sad');
    const nationality = within(customSection).getByLabelText('Nationality');
    await user.selectOptions(nationality, 'USA');

    await user.click(screen.getByText('Register Patient'));

    await waitFor(() => expect(mockedSavePatient).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockedSaveEncounter).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining<Partial<Encounter>>({
          encounterType: 'reg-enc-uuid',
          patient: 'new-pt-uuid',
          obs: [
            { concept: 'weight-uuid', value: 50 },
            { concept: 'chief-complaint-uuid', value: 'sad' },
            { concept: 'nationality-uuid', value: 'usa' },
          ],
        }),
      ),
    );
  });

  it('retries saving registration obs after a failed attempt', async () => {
    const user = userEvent.setup();

    mockedUseConfig.mockReturnValue(configWithObs);

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <Router>
          <PatientRegistration isOffline={false} savePatientForm={FormManager.savePatientFormOnline} />
        </Router>
      </ResourcesContext.Provider>,
    );

    await fillRequiredFields();
    const customSection = screen.getByLabelText('Custom Section');
    const weight = within(customSection).getByLabelText('Weight (kg)');
    await user.type(weight, '-999');

    mockedSaveEncounter.mockRejectedValue({ status: 400, responseBody: { error: { message: 'an error message' } } });

    await user.click(screen.getByText('Register Patient'));

    await waitFor(() => expect(mockedSavePatient).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockedSaveEncounter).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'an error message' })),
    );

    mockedSaveEncounter.mockResolvedValue({});

    await user.click(screen.getByText('Register Patient'));
    await waitFor(() => expect(mockedSavePatient).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockedSaveEncounter).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' })));
  });
});

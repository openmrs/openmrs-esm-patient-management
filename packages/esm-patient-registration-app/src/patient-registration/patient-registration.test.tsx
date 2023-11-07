import React from 'react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showToast, useConfig, usePatient } from '@openmrs/esm-framework';
import { FormManager } from './form-manager';
import { saveEncounter, savePatient } from './patient-registration.resource';
import type { Encounter } from './patient-registration.types';
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

jest.setTimeout(10000);

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
  user.click(genderInput);
};

describe('patient registration component', () => {
  describe('when registering a new patient', () => {
    beforeEach(() => {
      mockedUseConfig.mockReturnValue(mockOpenmrsConfig);
      mockedSavePatient.mockReturnValue({ data: { uuid: 'new-pt-uuid' }, ok: true });
      mockedSaveEncounter.mockClear();
      mockedShowToast.mockClear();
      jest.clearAllMocks();
    });

    it('renders without crashing', () => {
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
          expect.objectContaining({
            identifiers: [], //TODO when the identifer story is finished: { identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' },
            person: {
              addresses: expect.arrayContaining([expect.any(Object)]),
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

      await user.type(givenNameInput, '5');
      await user.click(screen.getByText('Register Patient'));

      expect(mockedSavePatientForm).not.toHaveBeenCalled();
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
      const weight = within(customSection).getByLabelText('Weight (kg) (optional)');
      await user.type(weight, '50');
      const complaint = within(customSection).getByLabelText('Chief Complaint (optional)');
      await user.type(complaint, 'sad');
      const nationality = within(customSection).getByLabelText('Nationality');
      await user.selectOptions(nationality, 'USA');

      await user.click(screen.getByText('Register Patient'));

      await waitFor(() => expect(mockedSavePatient).toHaveBeenCalled());
      await waitFor(() =>
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
      const weight = within(customSection).getByLabelText('Weight (kg) (optional)');
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
      await waitFor(() => expect(mockedSavePatient).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(mockedSaveEncounter).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' })));
    });
  });

  describe('when updating an existing patient details', () => {
    beforeEach(() => {
      mockedUseConfig.mockReturnValue(mockOpenmrsConfig);
      mockedSavePatient.mockReturnValue({ data: { uuid: 'new-pt-uuid' }, ok: true });
      mockedSaveEncounter.mockClear();
      mockedShowToast.mockClear();
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

      render(
        <ResourcesContext.Provider value={mockResourcesContextValue}>
          <Router>
            <PatientRegistration isOffline={false} savePatientForm={mockedSavePatient} />
          </Router>
        </ResourcesContext.Provider>,
      );

      const givenNameInput: HTMLInputElement = screen.getByLabelText(/First Name/);
      const familyNameInput: HTMLInputElement = screen.getByLabelText(/Family Name/);
      const middleNameInput: HTMLInputElement = screen.getByLabelText(/Middle Name/);
      const dateOfBirthInput: HTMLInputElement = screen.getByLabelText('Date of Birth');
      const genderInput: HTMLInputElement = screen.getByLabelText(/Male/);

      // assert initial values
      expect(givenNameInput.value).toBe('John');
      expect(familyNameInput.value).toBe('Wilson');
      expect(middleNameInput.value).toBeFalsy();
      expect(dateOfBirthInput.value).toBe('4/4/1972');
      expect(genderInput.value).toBe('Male');

      // do some edits
      await user.clear(givenNameInput);
      await user.clear(middleNameInput);
      await user.clear(familyNameInput);
      await user.type(givenNameInput, 'Eric');
      await user.type(middleNameInput, 'Johnson');
      await user.type(familyNameInput, 'Smith');
      await user.click(screen.getByText('Update Patient'));

      await waitFor(() =>
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
            gender: 'Male',
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
        ),
      );
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as patientRegistrationResource from './patient-registration.resource';
import * as mockOpenmrsFramework from '@openmrs/esm-framework/mock';
import { PatientRegistration } from './patient-registration.component';
import { mockPatient } from '../../__mocks__/patient.mock';
import { match } from 'react-router-dom';
import FormManager from './form-manager';
import { Resources, ResourcesContext } from '../offline.resources';
import { showToast, useConfig } from '@openmrs/esm-framework';
import { cloneDeep } from 'lodash-es';
import { RegistrationConfig } from '../config-schema';
import { useConcept, useConceptAnswers } from './field/field.resource';
import { ConceptResponse, Encounter } from './patient-registration-types';

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useLocation: () => ({
    pathname: 'openmrs/spa/patient-registration',
  }),
  useHistory: () => [],
}));

const predefinedAddressTemplate = {
  results: [
    {
      value:
        '<org.openmrs.layout.address.AddressTemplate>\r\n     <nameMappings class="properties">\r\n       <property name="postalCode" value="Location.postalCode"/>\r\n       <property name="address2" value="Location.address2"/>\r\n       <property name="address1" value="Location.address1"/>\r\n       <property name="country" value="Location.country"/>\r\n       <property name="stateProvince" value="Location.stateProvince"/>\r\n       <property name="cityVillage" value="Location.cityVillage"/>\r\n     </nameMappings>\r\n     <sizeMappings class="properties">\r\n       <property name="postalCode" value="4"/>\r\n       <property name="address1" value="40"/>\r\n       <property name="address2" value="40"/>\r\n       <property name="country" value="10"/>\r\n       <property name="stateProvince" value="10"/>\r\n       <property name="cityVillage" value="10"/>\r\n       <asset name="cityVillage" value="10"/>\r\n     </sizeMappings>\r\n     <lineByLineFormat>\r\n       <string>address1 address2</string>\r\n       <string>cityVillage stateProvince postalCode</string>\r\n       <string>country</string>\r\n     </lineByLineFormat>\r\n     <elementDefaults class="properties">\r\n            <property name="country" value=""/>\r\n     </elementDefaults>\r\n     <elementRegex class="properties">\r\n            <property name="address1" value="[a-zA-Z]+$"/>\r\n     </elementRegex>\r\n     <elementRegexFormats class="properties">\r\n            <property name="address1" value="Countries can only be letters"/>\r\n     </elementRegexFormats>\r\n   </org.openmrs.layout.address.AddressTemplate>',
    },
  ],
};

const mockResourcesContextValue = {
  addressTemplate: predefinedAddressTemplate,
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
      unidentifiedPatient: true,
      defaultUnknownGivenName: 'UNKNOWN',
      defaultUnknownFamilyName: 'UNKNOWN',
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

const sampleMatchProp: match<{ patientUuid: string }> = {
  isExact: false,
  path,
  url: path.replace(':patientUuid', '1'),
  params: { patientUuid: '1' },
};

const mockUseConfig = useConfig as jest.Mock;

// Mock field.resource using the manual mock (in __mocks__)
jest.mock('./field/field.resource');

const configWithObs = cloneDeep(mockOpenmrsConfig);
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
configWithObs.sectionDefinitions.push({
  id: 'custom',
  name: 'Custom',
  fields: ['weight', 'chief complaint', 'nationality'],
});
configWithObs.sections.push('custom');
configWithObs.registrationObs.encounterTypeUuid = 'reg-enc-uuid';

jest.mock('./patient-registration.resource', () => ({
  ...(jest.requireActual('./patient-registration.resource') as any),
  savePatient: jest.fn(),
  saveEncounter: jest.fn(),
}));

const mockSavePatient = patientRegistrationResource.savePatient as jest.Mock;
const mockSaveEncounter = patientRegistrationResource.saveEncounter as jest.Mock;

const mockShowToast = showToast as jest.Mock;

const fillRequiredFields = async () => {
  const demographicsSection = await screen.findByLabelText('Demographics Section');
  const givenNameInput = within(demographicsSection).getByLabelText(/first/i) as HTMLInputElement;
  const familyNameInput = within(demographicsSection).getByLabelText(/family/i) as HTMLInputElement;
  const dateOfBirthInput = within(demographicsSection).getByLabelText(/date of birth/i) as HTMLInputElement;
  const genderInput = within(demographicsSection).getByLabelText(/Male/) as HTMLSelectElement;

  userEvent.type(givenNameInput, 'Paul');
  userEvent.type(familyNameInput, 'Gaihre');
  userEvent.clear(dateOfBirthInput);
  userEvent.type(dateOfBirthInput, '02/08/1993');
  fireEvent.blur(dateOfBirthInput);
  fireEvent.click(genderInput);
};

describe('patient registration', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(mockOpenmrsConfig);
    mockSavePatient.mockClear();
    mockSavePatient.mockReturnValue({ data: { uuid: 'new-pt-uuid' }, ok: true });
    mockSaveEncounter.mockClear();
    mockShowToast.mockClear();
  });

  it('renders without crashing', () => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <PatientRegistration isOffline={false} match={sampleMatchProp} savePatientForm={jest.fn()} />
      </ResourcesContext.Provider>,
    );
  });

  it('has the expected sections', async () => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <PatientRegistration isOffline={false} match={sampleMatchProp} savePatientForm={jest.fn()} />
      </ResourcesContext.Provider>,
    );
    await waitFor(() => expect(screen.getByLabelText(/Demographics Section/)).not.toBeNull());
    expect(screen.getByLabelText(/Contact Info Section/)).not.toBeNull();
  });

  it('saves the patient without extra info', async () => {
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <PatientRegistration
          isOffline={false}
          match={sampleMatchProp}
          savePatientForm={FormManager.savePatientFormOnline}
        />
      </ResourcesContext.Provider>,
    );

    await fillRequiredFields();
    userEvent.click(await screen.findByText('Register Patient'));

    await waitFor(() => {
      expect(patientRegistrationResource.savePatient).toHaveBeenCalledWith(
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
    const mockSavePatientForm = jest.fn();
    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <PatientRegistration isOffline={false} match={sampleMatchProp} savePatientForm={mockSavePatientForm} />
      </ResourcesContext.Provider>,
    );

    const givenNameInput = (await screen.findByLabelText('First Name')) as HTMLInputElement;

    userEvent.type(givenNameInput, '');

    userEvent.click(screen.getByText('Register Patient'));

    expect(mockSavePatientForm).not.toHaveBeenCalled();
  });

  it.skip('edits patient demographics', async () => {
    spyOn(patientRegistrationResource, 'savePatient').and.returnValue(Promise.resolve({}));
    spyOn(mockOpenmrsFramework, 'usePatient').and.returnValue({
      isLoading: false,
      patient: mockPatient,
      patientUuid: mockPatient.id,
      error: null,
    });

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <PatientRegistration
          isOffline={false}
          match={sampleMatchProp}
          savePatientForm={FormManager.savePatientFormOnline}
        />
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
    userEvent.clear(givenNameInput);
    userEvent.clear(middleNameInput);
    userEvent.clear(familyNameInput);
    userEvent.type(givenNameInput, 'Eric');
    userEvent.type(middleNameInput, 'Johnson');
    userEvent.type(familyNameInput, 'Smith');
    userEvent.type(address1, 'Bom Jesus Street');
    userEvent.click(screen.getByText('Update Patient'));

    expect(patientRegistrationResource.savePatient).toHaveBeenCalledWith(
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
    mockSaveEncounter.mockResolvedValue({});
    mockUseConfig.mockReturnValue(configWithObs);

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <PatientRegistration
          isOffline={false}
          match={sampleMatchProp}
          savePatientForm={FormManager.savePatientFormOnline}
        />
      </ResourcesContext.Provider>,
    );

    await fillRequiredFields();
    const customSection = screen.getByLabelText('Custom Section');
    const weight = within(customSection).getByLabelText('Weight (kg)');
    userEvent.type(weight, '50');
    const complaint = within(customSection).getByLabelText('Chief Complaint');
    userEvent.type(complaint, 'sad');
    const nationality = within(customSection).getByLabelText('Nationality');
    userEvent.selectOptions(nationality, 'USA');

    userEvent.click(screen.getByText('Register Patient'));

    await waitFor(() => expect(mockSavePatient).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockSaveEncounter).toHaveBeenCalledWith(
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
    mockUseConfig.mockReturnValue(configWithObs);

    render(
      <ResourcesContext.Provider value={mockResourcesContextValue}>
        <PatientRegistration
          isOffline={false}
          match={sampleMatchProp}
          savePatientForm={FormManager.savePatientFormOnline}
        />
      </ResourcesContext.Provider>,
    );

    await fillRequiredFields();
    const customSection = screen.getByLabelText('Custom Section');
    const weight = within(customSection).getByLabelText('Weight (kg)');
    userEvent.type(weight, '-999');

    mockSaveEncounter.mockRejectedValue({ status: 400, responseBody: { error: { message: 'an error message' } } });

    userEvent.click(screen.getByText('Register Patient'));

    await waitFor(() => expect(mockSavePatient).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockSaveEncounter).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ description: 'an error message' })),
    );

    mockSaveEncounter.mockResolvedValue({});

    userEvent.click(screen.getByText('Register Patient'));
    await waitFor(() => expect(mockSavePatient).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockSaveEncounter).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' })));
  });
});

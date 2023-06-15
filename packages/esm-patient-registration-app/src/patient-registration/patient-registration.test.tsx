import React from 'react';
import { BrowserRouter as Router, useParams } from 'react-router-dom';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showToast, useConfig, usePatient } from '@openmrs/esm-framework';
import { FormManager } from './form-manager';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { saveEncounter, savePatient } from './patient-registration.resource';
import { Encounter } from './patient-registration-types';
import { Resources, ResourcesContext } from '../offline.resources';
import { PatientRegistration } from './patient-registration.component';
import { RegistrationConfig } from '../config-schema';

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
  };
});

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
          identifiers: [], //TODO when the identifer story is finished: { identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' }
          // identifiers: [{ identifier: '', identifierType: '05a29f94-c0ed-11e2-94be-8c13b969e334', location: '' }],
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

    const givenNameInput = screen.getByLabelText(/First Name/) as HTMLInputElement;
    const familyNameInput = screen.getByLabelText(/Family Name/) as HTMLInputElement;
    const middleNameInput = screen.getByLabelText(/Middle Name/) as HTMLInputElement;
    const dateOfBirthInput = screen.getByLabelText('Date of Birth') as HTMLInputElement;
    const genderInput = screen.getByLabelText(/Male/) as HTMLSelectElement;
    const address1 = screen.getByLabelText('Location.address1 (optional)') as HTMLInputElement;

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
    await user.type(address1, 'Bom Jesus Street');
    await user.click(screen.getByText('Update Patient'));
    // screen.debug(undefined, 20000);

    // await waitFor(() => expect(mockedSavePatient).toHaveBeenCalled());
    //TODO: fix this test. It is failing because the savePatient method is not being called.
    // I tried debugging if after adding all the mocks the savePatientFormOnline method is being called but savePatient method is not.

    const expectedDemographics = {
      '0': {
        'Old Identification Number': '100732HE',
      },
      '1': {
        'OpenMRS ID': '100GEJ',
      },
      addNameInLocalLanguage: undefined,
      additionalFamilyName: '',
      additionalGivenName: '',
      additionalMiddleName: '',
      address: {
        address1: '',
      },
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
    };
    await waitFor(() =>
      expect(mockedSavePatient).toHaveBeenCalledWith(
        false,
        {
          '0': {
            'Old Identification Number': '100732HE',
          },
          '1': {
            'OpenMRS ID': '100GEJ',
          },
          addNameInLocalLanguage: undefined,
          additionalFamilyName: '',
          additionalGivenName: '',
          additionalMiddleName: '',
          address: {
            address1: '',
          },
          birthdate: new Date('1972-04-04T00:00:00.000Z'),
          birthdateEstimated: false,
          deathCause: '',
          deathDate: '',
          familyName: 'Smith',
          gender: expect.anything(),
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

    // eslint-disable-next-line no-console
    console.log('mocked', mockedSavePatient.mock.calls);
    /** The mock of useParams hook is not getting reset which is resulting in the below tests to fail.
     * These are the ways I tried to reset the mock but none of them worked.
     * If I will not mock the useParams the update patient button will not be visible. There will be Register Patient button
    // mockedUseParams.mockRestore();
    // mockedUseParams.mockReset();
    // mockedUseParams.mockClear();
    // mockedUseParams.mockReturnValue({ patientUuid: undefined });
    **/
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

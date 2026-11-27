/**
 * @vitest-environment jsdom
 *
 * The form-submit flow under test does not fire its callback under happy-dom
 * (likely a DOM-event-dispatch divergence). Run this file under jsdom.
 */
import React from 'react';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useParams } from 'react-router-dom';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  showModal,
  showSnackbar,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import type { AddressTemplate, Encounter, FormValues } from './patient-registration.types';
import { mockedAddressTemplate } from '__mocks__';
import { mockPatient, renderWithContext } from 'tools';
import { saveEncounter, savePatient } from './patient-registration.resource';
import { esmPatientRegistrationSchema, type RegistrationConfig } from '../config-schema';
import { FormManager, SavePatientTransactionManager, type SavePatientForm } from './form-manager';
import { PatientRegistration } from './patient-registration.component';
import { useInitialFormValues } from './patient-registration-hooks';
import { ResourcesContextProvider } from '../resources-context';

const mockSaveEncounter = vi.mocked(saveEncounter);
const mockSavePatient = vi.mocked(savePatient);
const mockShowModal = vi.mocked(showModal);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);
const mockUsePatient = vi.mocked(usePatient);
const mockUseParams = vi.mocked(useParams);
const mockUseInitialFormValues = vi.mocked(useInitialFormValues);

vi.mock('./field/field.resource', () => ({
  useConcept: vi.fn().mockImplementation((uuid: string) => {
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
  useConceptAnswers: vi.fn().mockImplementation((uuid: string) => {
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

const personAttributeTypeGate = vi.hoisted(() => {
  let released = false;
  const listeners = new Set<() => void>();
  return {
    isReleased: () => released,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    release: () => {
      released = true;
      listeners.forEach((listener) => listener());
    },
    reset: () => {
      released = false;
    },
  };
});

vi.mock('./field/person-attributes/person-attributes.resource', async () => {
  const { useSyncExternalStore } = await import('react');
  return {
    // Like the real hook, the type is not available on the first render. Tests make it available with
    // `personAttributeTypeGate.release()`.
    usePersonAttributeType: () => {
      const released = useSyncExternalStore(personAttributeTypeGate.subscribe, personAttributeTypeGate.isReleased);
      return released
        ? {
            data: { uuid: 'nickname-uuid', display: 'Nickname', format: 'java.lang.String' },
            isLoading: false,
            error: null,
          }
        : { data: undefined, isLoading: true, error: null };
    },
  };
});

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) as object),
  useLocation: () => ({
    pathname: 'openmrs/spa/patient-registration',
  }),
  useHistory: () => [],
  useParams: vi.fn().mockReturnValue({ patientUuid: undefined }),
}));

vi.mock('./patient-registration.resource', async () => ({
  ...((await vi.importActual('./patient-registration.resource')) as object),
  saveEncounter: vi.fn(),
  savePatient: vi.fn(),
}));

vi.mock('./patient-registration-hooks', async () => {
  const actual = (await vi.importActual('./patient-registration-hooks')) as object;
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
    useInitialFormValues: vi.fn().mockReturnValue([defaultInitialFormValues, vi.fn()]),
    usePatientUuidMap: vi.fn().mockReturnValue([{}, vi.fn()]),
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

/** Asks the form to let the user leave the page, as single-spa does before a route change. */
const navigateAway = () => {
  act(() => {
    window.dispatchEvent(
      new CustomEvent('single-spa:before-routing-event', {
        detail: { navigationIsCanceled: false, cancelNavigation: vi.fn(), newUrl: '/elsewhere' },
      }),
    );
  });
};

const renderWithOptionalPreferredSsn = (
  savePatientForm: SavePatientForm = vi.fn(),
  ssnFormat: { format: string; formatDescription: string } = { format: null, formatDescription: null },
) => {
  const defaultConfig = getDefaultsFromConfigSchema<RegistrationConfig>(esmPatientRegistrationSchema);
  mockUseConfig.mockReturnValue({
    ...defaultConfig,
    ...mockOpenmrsConfig,
    sectionDefinitions: [
      { id: 'demographics', name: 'Demographics', fields: ['name', 'gender', 'dob', 'id'] },
      { id: 'contact', name: 'Contact Info', fields: ['address'] },
    ],
    defaultPatientIdentifierTypes: ['ssn-uuid'],
    fieldConfigurations: {
      ...defaultConfig.fieldConfigurations,
      ...mockOpenmrsConfig.fieldConfigurations,
      identifier: { allowPreferredSelection: true },
    },
  });
  renderWithContext(<PatientRegistration savePatientForm={savePatientForm} />, ResourcesContextProvider, {
    ...mockResourcesContextValue,
    identifierTypes: [
      {
        uuid: 'ssn-uuid',
        name: 'SSN',
        fieldName: 'ssn',
        ...ssnFormat,
        isPrimary: false,
        required: false,
        uniquenessBehavior: null,
        identifierSources: [],
      },
    ],
  });
};

describe('Registering a new patient', () => {
  beforeEach(() => {
    personAttributeTypeGate.reset();
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      ...mockOpenmrsConfig,
    });
    mockSavePatient.mockResolvedValue({ data: { uuid: 'new-pt-uuid' }, ok: true } as any);
  });

  it('should render all the required fields and sections', async () => {
    renderWithContext(
      <PatientRegistration savePatientForm={vi.fn()} />,
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
      <PatientRegistration savePatientForm={FormManager.savePatientFormOnline} />,
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
          deathDate: null,
          causeOfDeath: null,
          causeOfDeathNonCoded: null,
          uuid: expect.anything(),
        },
        uuid: expect.anything(),
      }),
      undefined,
    );
  });

  it('should not save the patient if validation fails', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();

    renderWithContext(
      <PatientRegistration savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await screen.findByRole('heading', { name: /create new patient/i });
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    expect(mockSavePatientForm).not.toHaveBeenCalled();
  });

  it('lists the fields with errors in a fixed order when an empty form is submitted', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();

    renderWithContext(
      <PatientRegistration savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await screen.findByRole('heading', { name: /create new patient/i });
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalled());
    const { subtitle } = mockShowSnackbar.mock.calls.at(-1)[0];
    render(<>{subtitle}</>);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toMatchInlineSnapshot(`
      [
        "givenName",
        "familyName",
        "gender",
        "birthdate",
      ]
    `);
  });

  it('lists pattern errors in form order after schema errors', async () => {
    const user = userEvent.setup();
    const defaultConfig = getDefaultsFromConfigSchema<RegistrationConfig>(esmPatientRegistrationSchema);
    mockUseConfig.mockReturnValue({
      ...defaultConfig,
      ...mockOpenmrsConfig,
      sectionDefinitions: [
        { id: 'demographics', name: 'Demographics', fields: ['name', 'gender', 'dob', 'nickname', 'id'] },
        { id: 'contact', name: 'Contact Info', fields: ['address'] },
      ],
      fieldDefinitions: [
        {
          id: 'nickname',
          type: 'person attribute',
          label: 'Nickname',
          uuid: 'nickname-uuid',
          placeholder: '',
          validation: { required: false, matches: '^\\d+$' },
          answerConceptSetUuid: null,
          customConceptAnswers: [],
        },
      ],
      defaultPatientIdentifierTypes: ['ssn-uuid'],
    } as RegistrationConfig);
    renderWithContext(<PatientRegistration savePatientForm={vi.fn()} />, ResourcesContextProvider, {
      ...mockResourcesContextValue,
      identifierTypes: [
        {
          uuid: 'ssn-uuid',
          name: 'SSN',
          fieldName: 'ssn',
          format: '^A-\\d+$',
          formatDescription: 'SSN must look like A-123',
          isPrimary: false,
          required: false,
          uniquenessBehavior: null,
          identifierSources: [],
        },
      ],
    });

    // The nickname is placed before the identifier in the form but loads after it, so it registers its pattern
    // rule later.
    await user.type(await screen.findByRole('textbox', { name: /ssn/i }), 'B');
    act(() => personAttributeTypeGate.release());
    await user.type(await screen.findByRole('textbox', { name: /nickname/i }), 'abc');
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalled());
    const { subtitle } = mockShowSnackbar.mock.calls.at(-1)[0];
    render(<>{subtitle}</>);
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'givenName',
      'familyName',
      'gender',
      'birthdate',
      'attributes',
      'identifiers',
    ]);
  });

  it('shows the missing-value error as soon as an empty identifier is marked as preferred', async () => {
    const user = userEvent.setup();
    renderWithOptionalPreferredSsn();

    await user.click(await screen.findByRole('radio', { name: /mark ssn as preferred/i }));

    const ssnInput = screen.getByRole('textbox', { name: 'SSN' });
    expect(await screen.findByText('Identifier value is required')).toBeInTheDocument();
    expect(ssnInput).toHaveAttribute('aria-invalid', 'true');

    await user.type(ssnInput, '123-45-6789');

    await waitFor(() => expect(screen.queryByText('Identifier value is required')).not.toBeInTheDocument());
    expect(ssnInput).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('keeps unsaved identifier selections while another field changes', async () => {
    const user = userEvent.setup();
    const identifierType = {
      format: null,
      formatDescription: null,
      isPrimary: false,
      required: false,
      uniquenessBehavior: null,
      identifierSources: [],
    };
    const defaultConfig = getDefaultsFromConfigSchema<RegistrationConfig>(esmPatientRegistrationSchema);
    mockUseConfig.mockReturnValue({
      ...defaultConfig,
      ...mockOpenmrsConfig,
      sectionDefinitions: [
        { id: 'demographics', name: 'Demographics', fields: ['name', 'gender', 'dob', 'id'] },
        { id: 'contact', name: 'Contact Info', fields: ['address'] },
      ],
      defaultPatientIdentifierTypes: ['ssn-uuid'],
    });
    renderWithContext(<PatientRegistration savePatientForm={vi.fn()} />, ResourcesContextProvider, {
      ...mockResourcesContextValue,
      identifierTypes: [
        { uuid: 'ssn-uuid', name: 'SSN', fieldName: 'ssn', ...identifierType },
        { uuid: 'passport-uuid', name: 'Passport', fieldName: 'passport', ...identifierType },
      ],
    });

    await user.click(await screen.findByRole('button', { name: /configure/i }));
    await user.click(screen.getByRole('checkbox', { name: 'Passport' }));
    expect(screen.getByRole('checkbox', { name: 'Passport' })).toBeChecked();

    await user.type(screen.getByLabelText(/first name/i), 'Paul');
    await user.tab();

    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toHaveValue('Paul'));
    expect(screen.getByRole('checkbox', { name: 'Passport' })).toBeChecked();
  });

  it('explains on the field why an empty preferred identifier blocks registration', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();
    renderWithOptionalPreferredSsn(mockSavePatientForm);

    await fillRequiredFields();
    await user.click(await screen.findByRole('radio', { name: /mark ssn as preferred/i }));
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    const ssnInput = await screen.findByRole('textbox', { name: 'SSN' });
    expect(screen.queryByRole('textbox', { name: /ssn \(optional\)/i })).not.toBeInTheDocument();
    expect(await screen.findByText('Identifier value is required')).toBeInTheDocument();
    expect(ssnInput).toHaveAttribute('aria-invalid', 'true');
    expect(mockSavePatientForm).not.toHaveBeenCalled();
  });

  it('shows the identifier format error after submit', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();
    renderWithOptionalPreferredSsn(mockSavePatientForm, {
      format: '^A-\\d+$',
      formatDescription: 'SSN must look like A-123',
    });

    await fillRequiredFields();
    await user.type(await screen.findByRole('textbox', { name: /ssn/i }), 'B');
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    expect(await screen.findByText('SSN must look like A-123')).toBeInTheDocument();
    expect(mockSavePatientForm).not.toHaveBeenCalled();
  });

  it('renders and saves registration obs', async () => {
    const user = userEvent.setup();

    mockSaveEncounter.mockResolvedValue({} as unknown as FetchResponse);
    mockUseConfig.mockReturnValue(configWithObs);

    renderWithContext(
      <PatientRegistration savePatientForm={FormManager.savePatientFormOnline} />,
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
      <PatientRegistration savePatientForm={FormManager.savePatientFormOnline} />,
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

  it('does not send empty obs fields when saving', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();
    mockUseConfig.mockReturnValue(configWithObs);

    renderWithContext(
      <PatientRegistration savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await fillRequiredFields();
    // Visit an obs field and leave it empty.
    await user.click(within(screen.getByLabelText('Custom Section')).getByLabelText('Weight (kg) (optional)'));
    await user.tab();
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    await waitFor(() => expect(mockSavePatientForm).toHaveBeenCalled());
    expect(Object.keys(mockSavePatientForm.mock.calls[0][1].obs ?? {})).toEqual([]);
  });

  it('does not mark fields touched when native validation blocks the submit', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();

    renderWithContext(
      <PatientRegistration savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await screen.findByRole('heading', { name: /create new patient/i });
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalled());
    expect(screen.getByLabelText(/first name/i)).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Given name is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Gender is required')).not.toBeInTheDocument();
    navigateAway();
    expect(mockShowModal).not.toHaveBeenCalled();
    expect(mockSavePatientForm).not.toHaveBeenCalled();
  });

  it('marks all fields touched after a failed submit', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();

    renderWithContext(
      <PatientRegistration savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    // Fill the natively required fields, so that the form submits, but leave the sex, which only the schema needs.
    const demographicsSection = await screen.findByLabelText('Demographics Section');
    await user.type(within(demographicsSection).getByLabelText(/first/i), 'Paul');
    await user.type(within(demographicsSection).getByLabelText(/family/i), 'Gaihre');
    const dateOfBirthInput = within(demographicsSection).getByLabelText(/date of birth/i);
    fireEvent.change(dateOfBirthInput, { target: { value: '1993-08-02' } });
    fireEvent.blur(dateOfBirthInput);
    await user.click(screen.getByRole('button', { name: /register patient/i }));

    expect(await screen.findByText('Gender is required')).toBeInTheDocument();
    navigateAway();
    expect(mockShowModal).toHaveBeenCalledWith('cancel-patient-edit-modal', expect.anything(), expect.anything());
    expect(mockSavePatientForm).not.toHaveBeenCalled();
  });

  // No field is registered with React Hook Form, so this test cannot fail today; it guards against future focus logic.
  it('does not move focus to the first error after a failed submit', async () => {
    const user = userEvent.setup();

    renderWithContext(<PatientRegistration savePatientForm={vi.fn()} />, ResourcesContextProvider, {
      ...mockResourcesContextValue,
    });

    const demographicsSection = await screen.findByLabelText('Demographics Section');
    await user.type(within(demographicsSection).getByLabelText(/first/i), 'Paul');
    await user.type(within(demographicsSection).getByLabelText(/family/i), 'Gaihre');
    const dateOfBirthInput = within(demographicsSection).getByLabelText(/date of birth/i);
    fireEvent.change(dateOfBirthInput, { target: { value: '1993-08-02' } });
    fireEvent.blur(dateOfBirthInput);
    const registerButton = screen.getByRole('button', { name: /register patient/i });
    await user.click(registerButton);

    expect(await screen.findByText('Gender is required')).toBeInTheDocument();
    expect(registerButton).toHaveFocus();
  });

  it('shows the error of an empty field after blur without typing', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <PatientRegistration savePatientForm={vi.fn()} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    const givenNameInput = await screen.findByLabelText(/first name/i);
    await user.click(givenNameInput);
    await user.tab();

    await waitFor(() => expect(givenNameInput).toHaveAttribute('aria-invalid', 'true'));
    expect(screen.getByText('Given name is required')).toBeInTheDocument();
  });

  it('shows the name errors at once after the name-known toggle goes back to yes', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <PatientRegistration savePatientForm={vi.fn()} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    const demographicsSection = await screen.findByLabelText('Demographics Section');
    const [nameKnownToggle] = within(demographicsSection).getAllByRole('tablist');
    await user.click(within(nameKnownToggle).getByRole('tab', { name: 'No' }));
    await user.click(within(nameKnownToggle).getByRole('tab', { name: 'Yes' }));

    expect(await screen.findByText('Given name is required')).toBeInTheDocument();
    expect(screen.getByText('Family name is required')).toBeInTheDocument();
  });

  it('marks the birthdate invalid at once after the birthdate-known toggle goes back to yes', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <PatientRegistration savePatientForm={vi.fn()} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    const demographicsSection = await screen.findByLabelText('Demographics Section');
    const dobToggle = within(demographicsSection).getAllByRole('tablist')[1];
    await user.click(within(dobToggle).getByRole('tab', { name: 'No' }));
    await user.type(within(demographicsSection).getByLabelText(/estimated age in years/i), '30');
    await user.tab();
    await user.click(within(dobToggle).getByRole('tab', { name: 'Yes' }));

    await waitFor(() => expect(within(demographicsSection).getByLabelText(/date of birth/i)).toBeInTheDocument());
    expect(await screen.findByText('Birthday is required')).toBeInTheDocument();
  });

  it('arms the unsaved-changes prompt after a blur only', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <PatientRegistration savePatientForm={vi.fn()} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await user.click(await screen.findByLabelText(/first name/i));
    await user.tab();

    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toHaveAttribute('aria-invalid', 'true'));
    navigateAway();
    expect(mockShowModal).toHaveBeenCalledWith('cancel-patient-edit-modal', expect.anything(), expect.anything());
  });

  it('re-enables the submit button after a successful save', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn<SavePatientForm>().mockResolvedValue(undefined);

    renderWithContext(
      <PatientRegistration savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await fillRequiredFields();
    const registerButton = screen.getByRole('button', { name: /register patient/i });
    await user.click(registerButton);

    await waitFor(() => expect(mockSavePatientForm).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByRole('button', { name: /register patient/i })).toBeEnabled());
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
      vi.fn(),
    ]);
  });

  it('edits patient demographics', async () => {
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();

    renderWithContext(
      <PatientRegistration savePatientForm={mockSavePatientForm} />,
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
      null,
      undefined,
      expect.anything(),
      expect.anything(),
      expect.anything(),
      { patientSaved: false, generatedIdentifiers: {}, addedIdentifiers: {} },
    );
  });

  it('keeps a loaded person attribute without a value, so the save deletes it', async () => {
    // A concept attribute whose concept no longer exists loads with a `null` value, which becomes `undefined`.
    const user = userEvent.setup();
    const mockSavePatientForm = vi.fn();
    const [patientValues] = mockUseInitialFormValues(mockPatient, mockPatient.id);
    mockUseInitialFormValues.mockReturnValue([
      { ...patientValues, attributes: { 'missing-concept-attribute-type-uuid': undefined } },
      vi.fn(),
    ]);

    renderWithContext(
      <PatientRegistration savePatientForm={mockSavePatientForm} />,
      ResourcesContextProvider,
      mockResourcesContextValue,
    );

    await screen.findByRole('heading', { name: /edit patient details/i });
    await user.click(screen.getByRole('button', { name: /update patient/i }));

    await waitFor(() => expect(mockSavePatientForm).toHaveBeenCalled());
    const savedAttributes = mockSavePatientForm.mock.calls[0][1].attributes;
    expect(Object.keys(savedAttributes)).toEqual(['missing-concept-attribute-type-uuid']);
  });

  it('resets values and touched state when initial values change', async () => {
    const user = userEvent.setup();
    const [patientValues] = mockUseInitialFormValues(mockPatient, mockPatient.id);
    const emptyValues = { ...patientValues, givenName: '', familyName: '', gender: '', birthdate: '', identifiers: {} };
    let patientLoaded = false;
    mockUsePatient.mockImplementation(() => ({
      error: null,
      isLoading: !patientLoaded,
      patient: patientLoaded ? mockPatient : undefined,
      patientUuid: mockPatient.id,
    }));
    mockUseInitialFormValues.mockImplementation((patient) => [patient ? patientValues : emptyValues, vi.fn()]);
    const renderForm = () => (
      <ResourcesContextProvider value={mockResourcesContextValue}>
        <PatientRegistration savePatientForm={vi.fn()} />
      </ResourcesContextProvider>
    );
    const { rerender } = render(renderForm());

    await user.type(screen.getByLabelText(/first name/i), 'Typed before load');
    await user.tab();

    patientLoaded = true;
    rerender(renderForm());

    await waitFor(() => expect(screen.getByLabelText(/first name/i)).toHaveValue(mockPatient.name[0].given[0]));
    navigateAway();
    expect(mockShowModal).not.toHaveBeenCalled();
  });

  it('keeps a cleared field empty and shows its error after the patient data loads', async () => {
    const user = userEvent.setup();
    const [patientValues] = mockUseInitialFormValues(mockPatient, mockPatient.id);
    const emptyValues = { ...patientValues, givenName: '', familyName: '', gender: '', birthdate: '', identifiers: {} };
    let patientLoaded = false;
    mockUsePatient.mockImplementation(() => ({
      error: null,
      isLoading: !patientLoaded,
      patient: patientLoaded ? mockPatient : undefined,
      patientUuid: mockPatient.id,
    }));
    mockUseInitialFormValues.mockImplementation((patient) => [patient ? patientValues : emptyValues, vi.fn()]);
    const renderForm = () => (
      <ResourcesContextProvider value={mockResourcesContextValue}>
        <PatientRegistration savePatientForm={vi.fn()} />
      </ResourcesContextProvider>
    );
    const { rerender } = render(renderForm());

    patientLoaded = true;
    rerender(renderForm());

    const givenNameInput = screen.getByLabelText(/first name/i);
    await waitFor(() => expect(givenNameInput).toHaveValue(mockPatient.name[0].given[0]));
    await user.clear(givenNameInput);
    await user.tab();

    expect(givenNameInput).toHaveValue('');
    expect(await screen.findByText('Given name is required')).toBeInTheDocument();
  });

  it.each(['another-patient-uuid', undefined])(
    'preserves retry state for the same patient and resets it when the route patient changes to %s',
    async (nextPatientUuid) => {
      const user = userEvent.setup();
      const mockSavePatientForm = vi.fn<SavePatientForm>().mockRejectedValue(new Error('Save failed'));
      const renderForm = () => (
        <ResourcesContextProvider value={mockResourcesContextValue}>
          <PatientRegistration savePatientForm={mockSavePatientForm} />
        </ResourcesContextProvider>
      );
      const { rerender } = render(renderForm());

      await user.click(screen.getByRole('button', { name: /update patient/i }));
      expect(mockSavePatientForm).toHaveBeenCalledOnce();
      const firstManager = mockSavePatientForm.mock.calls[0][8];
      firstManager.patientSaved = true;
      firstManager.generatedIdentifiers.openMrsId = { sourceUuid: 'source-uuid', identifier: '10001V' };
      firstManager.addedIdentifiers.openMrsId = '10001V';

      rerender(renderForm());
      await user.click(screen.getByRole('button', { name: /update patient/i }));
      expect(mockSavePatientForm).toHaveBeenCalledTimes(2);
      expect(mockSavePatientForm.mock.calls[1][8]).toBe(firstManager);
      expect(firstManager.addedIdentifiers.openMrsId).toBe('10001V');

      mockUseParams.mockReturnValue({ patientUuid: nextPatientUuid });
      rerender(renderForm());
      await user.click(screen.getByRole('button', { name: /update patient|register patient/i }));
      expect(mockSavePatientForm).toHaveBeenCalledTimes(3);
      const nextManager = mockSavePatientForm.mock.calls[2][8];
      expect(nextManager).not.toBe(firstManager);
      expect(nextManager).toEqual(new SavePatientTransactionManager());
    },
  );
});

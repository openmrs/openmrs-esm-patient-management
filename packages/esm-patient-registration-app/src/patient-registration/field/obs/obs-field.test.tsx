import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { esmPatientRegistrationSchema, type FieldDefinition, type RegistrationConfig } from '../../../config-schema';
import { useConcept, useConceptAnswers } from '../field.resource';
import { ObsField } from './obs-field.component';
import { PatientRegistrationContext, type PatientRegistrationContextProps } from '../../patient-registration-context';
import { mockOpenmrsId, mockPatient } from '__mocks__';

const mockUseConcept = jest.mocked(useConcept);
const mockUseConceptAnswers = jest.mocked(useConceptAnswers);
const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

jest.mock('../field.resource');
jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  OpenmrsDatePicker: jest.fn().mockImplementation(({ id, labelText, value, onChange }) => {
    return (
      <>
        <label htmlFor={id}>{labelText}</label>
        <input
          id={id}
          value={value ? dayjs(value).format('DD/MM/YYYY') : undefined}
          onChange={(evt) => onChange(dayjs(evt.target.value).toDate())}
        />
      </>
    );
  }),
}));

const useConceptMockImpl = (uuid: string) => {
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
  } else if (uuid == 'vaccination-date-uuid') {
    data = {
      uuid: 'vaccination-date-uuid',
      display: 'Vaccination Date',
      datatype: { display: 'Date', uuid: 'date' },
      answers: [],
      setMembers: [],
    };
  } else {
    throw Error(`Programming error, you probably didn't mean to do this: unknown concept uuid '${uuid}'`);
  }
  return {
    data: data ?? null,
    isLoading: !data,
  };
};

const useConceptAnswersMockImpl = (uuid: string) => {
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
  } else if (uuid == '') {
    return {
      data: [],
      isLoading: false,
    };
  } else {
    throw Error(`Programming error, you probably didn't mean to do this: unknown concept answer set uuid '${uuid}'`);
  }
};

type FieldProps = {
  children: ({ field, form: { touched, errors }, meta }) => React.ReactNode;
};

jest.mock('formik', () => ({
  ...(jest.requireActual('formik') as object),
  Field: jest.fn(({ children }: FieldProps) => (
    <>{children({ field: {}, form: { touched: {}, errors: {} }, meta: { error: undefined } })}</>
  )),
  useField: jest.fn(() => [{ value: null }, {}]),
}));

const textFieldDef: FieldDefinition = {
  id: 'chief-complaint',
  type: 'obs',
  label: 'Chief complaint',
  placeholder: '',
  showHeading: false,
  uuid: 'chief-complaint-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

const numberFieldDef: FieldDefinition = {
  id: 'weight',
  type: 'obs',
  label: 'Weight',
  placeholder: '',
  showHeading: false,
  uuid: 'weight-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

const dateFieldDef: FieldDefinition = {
  id: 'vac_date',
  type: 'obs',
  label: 'Vaccination date',
  placeholder: '',
  showHeading: false,
  uuid: 'vaccination-date-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

const codedFieldDef: FieldDefinition = {
  id: 'nationality',
  type: 'obs',
  label: 'Nationality',
  placeholder: '',
  showHeading: false,
  uuid: 'nationality-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [],
};

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

describe('ObsField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      registrationObs: { encounterTypeUuid: 'reg-enc-uuid' },
    } as RegistrationConfig);
    mockUseConcept.mockImplementation(useConceptMockImpl);
    mockUseConceptAnswers.mockImplementation(useConceptAnswersMockImpl);
  });

  it("logs an error and doesn't render if no registration encounter type is provided", () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      registrationObs: { encounterTypeUuid: null },
    } as RegistrationConfig);

    console.error = jest.fn();
    render(<ObsField fieldDefinition={textFieldDef} />);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/no registration encounter type has been configured/i),
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders a text box for text concept', () => {
    render(<ObsField fieldDefinition={textFieldDef} />);

    expect(screen.getByRole('textbox', { name: 'Chief complaint (optional)' })).toBeInTheDocument();
  });

  it('renders a number box for number concept', () => {
    render(<ObsField fieldDefinition={numberFieldDef} />);

    expect(screen.getByRole('spinbutton', { name: 'Weight (optional)' })).toBeInTheDocument();
  });

  it('renders a datepicker for date concept', async () => {
    render(
      <PatientRegistrationContext.Provider value={initialContextValues}>
        <ObsField fieldDefinition={dateFieldDef} />
      </PatientRegistrationContext.Provider>,
    );

    const datePickerInput = screen.getByRole('textbox');
    expect(datePickerInput).toBeInTheDocument();

    await userEvent.type(datePickerInput, '28/05/2024');
    expect(datePickerInput).toHaveValue('28/05/2024');
  });

  it('renders a select for a coded concept', () => {
    render(<ObsField fieldDefinition={codedFieldDef} />);

    expect(screen.getByRole('combobox', { name: 'Nationality' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'USA' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mexico' })).toBeInTheDocument();
  });

  it('select uses answerConcept for answers when it is provided', async () => {
    render(<ObsField fieldDefinition={{ ...codedFieldDef, answerConceptSetUuid: 'other-countries-uuid' }} />);

    expect(screen.getByRole('combobox', { name: 'Nationality' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Kenya' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Uganda' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'USA' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Mexico' })).not.toBeInTheDocument();
  });

  it('select uses customConceptAnswers for answers when provided', async () => {
    render(
      <ObsField
        fieldDefinition={{
          ...codedFieldDef,
          customConceptAnswers: [
            {
              uuid: 'mozambique-uuid',
              label: 'Mozambique',
            },
          ],
        }}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Nationality' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mozambique' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Uganda' })).not.toBeInTheDocument();
  });
});

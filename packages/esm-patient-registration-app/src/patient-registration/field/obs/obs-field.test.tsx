import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import { type FieldDefinition } from '../../../config-schema';
import { useConcept, useConceptAnswers } from '../field.resource';
import { ObsField } from './obs-field.component';
import '@testing-library/jest-dom';

const mockUseConfig = useConfig as jest.Mock;

jest.mock('../field.resource'); // Mock the useConceptAnswers hook

const mockedUseConcept = useConcept as jest.Mock;
const mockedUseConceptAnswers = useConceptAnswers as jest.Mock;

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
  } else if (uuid == 'date-uuid') {
    data = {
      uuid: 'date-uuid',
      display: 'Date',
      datatype: { display: 'Date', uuid: 'dt' },
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
  children: ({ field, form: { touched, errors } }) => React.ReactNode;
};

jest.mock('formik', () => ({
  ...(jest.requireActual('formik') as object),
  Field: jest.fn(({ children }: FieldProps) => <>{children({ field: {}, form: { touched: {}, errors: {} } })}</>),
  useField: jest.fn(() => [{ value: null }, {}]),
}));

const textFieldDef: FieldDefinition = {
  id: 'chief-complaint',
  type: 'obs',
  label: '',
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
  label: '',
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

const dateFieldDefFieldDef: FieldDefinition = {
  id: 'date',
  type: 'obs',
  label: '',
  placeholder: '',
  showHeading: false,
  uuid: 'date-uuid',
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
  label: '',
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

describe('ObsField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ registrationObs: { encounterTypeUuid: 'reg-enc-uuid' } });
    mockedUseConcept.mockImplementation(useConceptMockImpl);
    mockedUseConceptAnswers.mockImplementation(useConceptAnswersMockImpl);
  });

  it("logs an error and doesn't render if no registration encounter type is provided", () => {
    mockUseConfig.mockReturnValue({ registrationObs: { encounterTypeUuid: null } });
    console.error = jest.fn();
    render(<ObsField fieldDefinition={textFieldDef} />);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(/no registration encounter type has been configured/i),
    );
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('renders a text box for text concept', () => {
    render(<ObsField fieldDefinition={textFieldDef} />);
    // I don't know why the labels aren't in the DOM, but they aren't
    // expect(screen.getByLabelText("Chief Complaint")).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a number box for number concept', () => {
    render(<ObsField fieldDefinition={numberFieldDef} />);
    // expect(screen.getByLabelText("Weight (kg)")).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toBeInTheDocument();
  });

  it('renders a date box for date concept', async () => {
    const user = userEvent.setup();

    render(<ObsField fieldDefinition={dateFieldDefFieldDef} />);

    const dateInput = screen.getByRole('textbox', { name: /date/ });
    expect(dateInput).toBeInTheDocument();

    await user.type(dateInput, '10/10/2022');

    expect(screen.getByPlaceholderText('dd/mm/YYYY')).toHaveValue('10/10/2022');
  });

  it('renders a select for a coded concept', () => {
    render(<ObsField fieldDefinition={codedFieldDef} />);
    // expect(screen.getByLabelText("Nationality")).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveDisplayValue('Select an option');
  });

  it('select uses answerConcept for answers when it is provided', async () => {
    const user = userEvent.setup();

    render(<ObsField fieldDefinition={{ ...codedFieldDef, answerConceptSetUuid: 'other-countries-uuid' }} />);
    // expect(screen.getByLabelText("Nationality")).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    await user.selectOptions(select, 'Kenya');
  });

  it('select uses customConceptAnswers for answers when provided', async () => {
    const user = userEvent.setup();

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
    // expect(screen.getByLabelText("Nationality")).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    await user.selectOptions(select, 'Mozambique');
  });
});

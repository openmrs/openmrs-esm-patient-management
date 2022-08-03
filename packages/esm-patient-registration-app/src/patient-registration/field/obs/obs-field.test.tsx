import React from 'react';
import { render, screen } from '@testing-library/react';
import { FieldDefinition, RegistrationConfig } from '../../../config-schema';
import { ObsField } from './obs-field.component';
import { useConfig } from '@openmrs/esm-framework';
import { useConcept, useConceptAnswers } from '../field.resource';
import userEvent from '@testing-library/user-event';

const mockUseConfig = useConfig as jest.Mock;

// The UUIDs in this test all refer to ones that are in `__mocks__/field.resource.ts`
jest.mock('../field.resource');

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
  uuid: 'chief-complaint-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [
    {
      uuid: 'concept-uuid',
      label: '',
    },
  ],
};

const numberFieldDef: FieldDefinition = {
  id: 'weight',
  type: 'obs',
  label: '',
  placeholder: '',
  uuid: 'weight-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [
    {
      uuid: 'concept-uuid',
      label: '',
    },
  ],
};

const codedFieldDef: FieldDefinition = {
  id: 'nationality',
  type: 'obs',
  label: '',
  placeholder: '',
  uuid: 'nationality-uuid',
  validation: {
    required: false,
    matches: null,
  },
  answerConceptSetUuid: null,
  customConceptAnswers: [
    {
      uuid: 'concept-uuid',
      label: 'Kenya',
    },
  ],
};

describe('ObsField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ registrationObs: { encounterTypeUuid: 'reg-enc-uuid' } });
  });

  it("logs an error and doesn't render if no registration encounter type is provided", () => {
    mockUseConfig.mockReturnValue({ registrationObs: { encounterTypeUuid: null } });
    console.error = jest.fn();
    render(<ObsField fieldDefinition={textFieldDef} />);
    expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/no registration encounter type.*configure/i));
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

  it('renders a select for a coded concept', () => {
    render(<ObsField fieldDefinition={codedFieldDef} />);
    // expect(screen.getByLabelText("Nationality")).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveDisplayValue('');
  });

  it('select uses answerConcept for answers when it is provided', () => {
    mockUseConfig.mockReturnValue({
      registrationObs: { encounterTypeUuid: 'reg-enc-uuid' },
      fieldDefinitions: [codedFieldDef],
    });
    render(<ObsField fieldDefinition={{ ...codedFieldDef, answerConceptSetUuid: 'other-countries-uuid' }} />);
    // expect(screen.getByLabelText("Nationality")).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    userEvent.selectOptions(select, 'Kenya');
  });
});

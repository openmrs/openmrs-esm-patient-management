import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';
import { GenderField } from './gender-field.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useConfig: jest.fn(() => ({
    fieldConfigurations: {
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
      name: {
        displayMiddleName: false,
        unidentifiedPatient: false,
        defaultUnknownGivenName: '',
        defaultUnknownFamilyName: '',
      },
    },
  })),
}));

jest.mock('react', () => ({
  ...(jest.requireActual('react') as any),
  useContext: jest.fn(() => ({
    setFieldValue: jest.fn(),
  })),
}));

jest.mock('formik', () => ({
  ...(jest.requireActual('formik') as any),
  useField: jest.fn(() => [{}, {}]),
}));

describe('GenderField', () => {
  it('has a label', () => {
    renderGenderField();

    expect(screen.getByRole('heading', { name: /sex/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^male/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/female/i)).toBeInTheDocument();
  });

  it('checks an option', async () => {
    const user = userEvent.setup();
    renderGenderField();

    await user.click(screen.getByText(/female/i));
    expect(screen.getByLabelText(/female/i)).toBeChecked();
    expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
  });
});

function renderGenderField() {
  render(
    <Formik initialValues={{}} onSubmit={null}>
      <Form>
        <GenderField />
      </Form>
    </Formik>,
  );
}

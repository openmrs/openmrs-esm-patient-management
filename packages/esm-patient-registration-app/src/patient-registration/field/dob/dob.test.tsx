import React, { useContext } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import { Formik, Form, useField } from 'formik';
import { DobField } from './dob.component';

jest.mock('formik', () => {
  const originalModule = jest.requireActual('formik');
  return {
    ...originalModule,
    useField: jest.fn(() => [{}, {}]),
  };
});

jest.mock('react', () => {
  const originalModule = jest.requireActual('react');
  return {
    ...originalModule,
    useContext: jest.fn(() => ({
      setFieldValue: jest.fn(),
    })),
  };
});

describe('dob', () => {
  it('renders the date of birth component', () => {
    renderDob();

    expect(screen.getByRole('heading', { name: /birth/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /no/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /date of birth/i })).toBeInTheDocument();
    expect(screen.getByText(/date of birth known?/i)).toBeInTheDocument();
  });

  it('changes value of datepicker', () => {
    renderDob();

    fireEvent.change(screen.getByPlaceholderText('dd/mm/YYYY'), {
      target: { value: '01/01/2020' },
    });
    expect(screen.getByPlaceholderText('dd/mm/YYYY')).toHaveValue('01/01/2020');
  });
});

function renderDob() {
  render(
    <Formik initialValues={{}} onSubmit={null}>
      <Form>
        <DobField />
      </Form>
    </Formik>,
  );
}

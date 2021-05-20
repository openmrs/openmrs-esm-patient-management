import React, { useContext } from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import { Formik, Form, useField } from 'formik';

import { DobField } from './dob.component';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useField: jest.fn(() => [{}, {}]),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(() => ({
    setFieldValue: jest.fn(),
  })),
}));

describe('dob', () => {
  const renderComponent = () => {
    return render(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <DobField />
        </Form>
      </Formik>,
    );
  };

  it('renders', () => {
    expect(renderComponent()).not.toBeFalsy();
  });

  it('changes value of datepicker', () => {
    const comp = renderComponent();
    fireEvent.change(comp.getByPlaceholderText('dd/mm/YYYY'), {
      target: { value: '01/01/2020' },
    });
    expect(comp.getByPlaceholderText('dd/mm/YYYY')).toHaveValue('01/01/2020');
  });
});

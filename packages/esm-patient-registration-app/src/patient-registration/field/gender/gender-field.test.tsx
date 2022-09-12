import React, { useContext } from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import { Formik, Form } from 'formik';

import { GenderField } from './gender-field.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useConfig: jest.fn(() => ({
    fieldConfigurations: {
      gender: [
        {
          value: 'Male',
          label: 'Male',
          id: 'male',
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
  const renderComponent = () => {
    return render(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <GenderField />
        </Form>
      </Formik>,
    );
  };

  it('renders', () => {
    expect(renderComponent()).not.toBeNull();
  });

  it('has a label', () => {
    expect(renderComponent().getAllByText('Sex')).toBeTruthy();
  });

  it('checks an option', () => {
    const component = renderComponent();
    fireEvent.click(component.getByLabelText('Male'));
    expect(component.getByLabelText('Male')).toBeChecked();
  });
});

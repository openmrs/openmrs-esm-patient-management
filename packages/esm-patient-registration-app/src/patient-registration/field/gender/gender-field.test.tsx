import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render } from '@testing-library/react';
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

  it('has a label', () => {
    expect(renderComponent().getAllByText('Sex')).toBeTruthy();
  });

  it('checks an option', async () => {
    const user = userEvent.setup();
    const component = renderComponent();
    expect(component.getByLabelText('Male').getAttribute('value')).toBe('male');
  });
});

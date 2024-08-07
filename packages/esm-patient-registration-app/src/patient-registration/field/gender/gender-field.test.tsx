import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { GenderField } from './gender-field.component';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

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
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
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
          allowUnidentifiedPatients: false,
          defaultUnknownGivenName: '',
          defaultUnknownFamilyName: '',
          displayCapturePhoto: false,
          displayReverseFieldOrder: false,
        },
      } as RegistrationConfig['fieldConfigurations'],
    });
  });
  it('has a label', () => {
    render(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <GenderField />
        </Form>
      </Formik>,
    );

    expect(screen.getByRole('heading', { name: /sex/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^male/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/female/i)).toBeInTheDocument();
  });

  it('checks an option', async () => {
    const user = userEvent.setup();
    render(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <GenderField />
        </Form>
      </Formik>,
    );

    await user.click(screen.getByText(/female/i));
    expect(screen.getByLabelText(/female/i)).toBeChecked();
    expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
  });
});

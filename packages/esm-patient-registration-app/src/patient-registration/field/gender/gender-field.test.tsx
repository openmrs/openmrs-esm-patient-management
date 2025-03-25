import React from 'react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { renderWithContext } from 'tools';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { type FormValues } from '../../patient-registration.types';
import {
  type PatientRegistrationContextProps,
  PatientRegistrationContextProvider,
} from '../../patient-registration-context';
import { GenderField } from './gender-field.component';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

const mockContextValues: PatientRegistrationContextProps = {
  currentPhoto: null,
  identifierTypes: [],
  inEditMode: false,
  initialFormValues: {
    gender: 'male',
  } as FormValues,
  isOffline: false,
  setCapturePhotoProps: jest.fn(),
  setFieldTouched: jest.fn(),
  setFieldValue: jest.fn(),
  validationSchema: esmPatientRegistrationSchema,
  values: {
    gender: 'male',
  } as FormValues,
};

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
    renderWithContext(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <GenderField />
        </Form>
      </Formik>,
      PatientRegistrationContextProvider,
      mockContextValues,
    );

    expect(screen.getByRole('heading', { name: /sex/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^male/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/female/i)).toBeInTheDocument();
  });

  it('checks an option', async () => {
    const user = userEvent.setup();

    renderWithContext(
      <Formik initialValues={{}} onSubmit={null}>
        <Form>
          <GenderField />
        </Form>
      </Formik>,
      PatientRegistrationContextProvider,
      mockContextValues,
    );

    await user.click(screen.getByText(/female/i));
    expect(screen.getByLabelText(/female/i)).toBeChecked();
    expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
  });
});

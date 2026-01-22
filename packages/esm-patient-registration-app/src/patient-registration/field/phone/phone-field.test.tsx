import React from 'react';
import { Formik, Form } from 'formik';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { PhoneField } from './phone-field.component';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);

// Mock PersonAttributeField since PhoneField is a wrapper around it
jest.mock('../person-attributes/person-attribute-field.component', () => ({
  PersonAttributeField: ({ fieldDefinition }) => (
    <div data-testid="phone-field">
      <label htmlFor="phone-input">Phone</label>
      <input id="phone-input" name="phone" data-field-uuid={fieldDefinition.uuid} />
    </div>
  ),
}));

/**
 * Helper to render PhoneField.
 */
const renderPhoneField = () => {
  return render(
    <Formik initialValues={{}} onSubmit={() => {}}>
      <Form>
        <PatientRegistrationContextProvider
          value={{
            identifierTypes: [],
            values: initialFormValues,
            validationSchema: null,
            inEditMode: false,
            setFieldValue: jest.fn().mockResolvedValue(undefined),
            setCapturePhotoProps: jest.fn(),
            setFieldTouched: jest.fn().mockResolvedValue(undefined),
            currentPhoto: '',
            isOffline: false,
            initialFormValues: initialFormValues,
          }}>
          <PhoneField />
        </PatientRegistrationContextProvider>
      </Form>
    </Formik>,
  );
};

describe('PhoneField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        phone: {
          personAttributeUuid: 'phone-uuid-123',
          validation: {
            required: false,
            matches: null,
          },
        },
      } as RegistrationConfig['fieldConfigurations'],
    });
  });

  it('renders the phone field', () => {
    renderPhoneField();

    expect(screen.getByTestId('phone-field')).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('passes correct field definition to PersonAttributeField', () => {
    renderPhoneField();

    const phoneInput = screen.getByLabelText(/phone/i);
    expect(phoneInput).toHaveAttribute('data-field-uuid', 'phone-uuid-123');
  });

  it('uses configured person attribute UUID', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        phone: {
          personAttributeUuid: 'custom-phone-uuid',
          validation: {
            required: false,
            matches: null,
          },
        },
      } as RegistrationConfig['fieldConfigurations'],
    });

    renderPhoneField();

    const phoneInput = screen.getByLabelText(/phone/i);
    expect(phoneInput).toHaveAttribute('data-field-uuid', 'custom-phone-uuid');
  });
});

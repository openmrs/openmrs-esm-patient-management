import React from 'react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { PhoneField } from './phone-field.component';
import { initialFormValues } from '../../patient-registration.component';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);

// Mock PersonAttributeField since PhoneField is a wrapper around it
vi.mock('../person-attributes/person-attribute-field.component', () => ({
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
  return renderWithRegistrationForm(<PhoneField />, {
    contextValues: {
      values: initialFormValues,
      setFieldValue: vi.fn().mockResolvedValue(undefined),
      setFieldTouched: vi.fn().mockResolvedValue(undefined),
      initialFormValues: initialFormValues,
    },
  });
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

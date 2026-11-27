import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import { AddressField } from './custom-address-field.component';
import type { FieldDefinition } from '../../../config-schema';

const fieldDefinition: FieldDefinition = {
  id: 'landmark',
  type: 'address',
  label: 'Nearest landmark',
  uuid: 'landmark-uuid',
  showHeading: false,
};

const renderAddressField = (definition: FieldDefinition = fieldDefinition) =>
  renderWithRegistrationForm(<AddressField fieldDefinition={definition} />);

describe('AddressField (custom address field)', () => {
  it('writes the typed value at the top-level path of the field id', async () => {
    const user = userEvent.setup();
    const { getValues } = renderAddressField();

    await user.type(screen.getByRole('textbox', { name: /Nearest landmark/ }), 'Next to the market');

    expect((getValues() as any).landmark).toBe('Next to the market');
    expect(getValues().address).toBeUndefined();
  });

  it('shows the value in the form in the input', () => {
    renderWithRegistrationForm(<AddressField fieldDefinition={fieldDefinition} />, {
      initialValues: { landmark: 'Near the market' } as any,
    });

    expect(screen.getByRole('textbox', { name: /Nearest landmark/ })).toHaveValue('Near the market');
  });

  it('touches the top-level path of the field id on blur', async () => {
    const user = userEvent.setup();
    const { getTouched } = renderAddressField();
    const input = screen.getByRole('textbox', { name: /Nearest landmark/ });

    await user.click(input);
    expect(getTouched().landmark).toBeUndefined();
    await user.tab();

    expect(getTouched().landmark).toBe(true);
  });

  it('labels an optional field as optional', () => {
    renderAddressField();

    expect(screen.getByLabelText('Nearest landmark (optional)')).toBeInTheDocument();
  });

  it('does not label a required field as optional', () => {
    renderAddressField({ ...fieldDefinition, validation: { required: true } });

    expect(screen.getByLabelText('Nearest landmark')).toBeRequired();
    expect(screen.queryByText(/optional/)).not.toBeInTheDocument();
  });
});

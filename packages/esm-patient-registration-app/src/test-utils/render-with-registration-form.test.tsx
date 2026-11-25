import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../patient-registration/input/basic-input/input/input.component';
import { renderWithRegistrationForm } from './render-with-registration-form';

describe('renderWithRegistrationForm', () => {
  it('renders a field and exposes its value', async () => {
    const user = userEvent.setup();
    const { getValues } = renderWithRegistrationForm(<Input id="givenName" name="givenName" labelText="First name" />, {
      initialValues: { givenName: 'Jo' },
    });

    const input = screen.getByLabelText(/first name/i) as HTMLInputElement;
    expect(input.value).toBe('Jo');

    await user.type(input, 'hn');

    expect(getValues().givenName).toBe('John');
  });
});

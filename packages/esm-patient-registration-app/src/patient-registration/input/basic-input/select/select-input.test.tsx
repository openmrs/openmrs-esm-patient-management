import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRegistrationForm } from '../../../../test-utils/render-with-registration-form';
import { SelectInput } from './select-input.component';
import type { FormValues } from '../../../patient-registration.types';

/**
 * Helper to render SelectInput component in a registration form.
 */
function renderSelectInput(
  props: {
    name?: string;
    label?: string;
    options?: string[];
    required?: boolean;
  } = {},
  initialValues: Record<string, string> = {},
) {
  const defaultProps = {
    name: 'select',
    label: 'Select',
    options: ['A Option', 'B Option'],
    required: false,
    ...props,
  };

  return renderWithRegistrationForm(<SelectInput {...defaultProps} />, {
    initialValues: { select: '', ...initialValues } as Partial<FormValues>,
  });
}

describe('SelectInput component', () => {
  describe('Rendering', () => {
    it('renders the select input', async () => {
      renderSelectInput({ required: true });

      const select = await screen.findByRole('combobox', { name: /select/i });
      expect(select).toBeInTheDocument();
    });

    it('shows required label when field is required', async () => {
      renderSelectInput({ required: true });

      const select = await screen.findByRole('combobox', { name: /^select$/i });
      expect(select).toBeInTheDocument();
      expect(screen.queryByRole('combobox', { name: /select \(optional\)/i })).not.toBeInTheDocument();
    });

    it('shows optional label when field is not required', async () => {
      renderSelectInput({ required: false });

      const select = await screen.findByRole('combobox', { name: /select \(optional\)/i });
      expect(select).toBeInTheDocument();
    });

    it('renders all provided options', async () => {
      renderSelectInput({ options: ['Option 1', 'Option 2', 'Option 3'], required: true });

      await screen.findByRole('combobox');

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('allows user to select an option', async () => {
      const user = userEvent.setup();
      renderSelectInput({ required: true });

      const select = await screen.findByRole('combobox', { name: /^select$/i });
      await user.selectOptions(select, 'A Option');

      await waitFor(() => {
        expect(select).toHaveValue('A Option');
      });
    });

    it('updates form values when user selects an option', async () => {
      const user = userEvent.setup();
      const { getValues } = renderWithRegistrationForm(
        <SelectInput name="select" label="Select" options={['A Option', 'B Option']} required />,
        { initialValues: { select: '' } as Partial<FormValues> },
      );
      const formValues = () => getValues() as unknown as Record<string, string>;

      const select = await screen.findByRole('combobox');
      await user.selectOptions(select, 'B Option');

      await waitFor(() => {
        expect(formValues().select).toBe('B Option');
      });
    });

    it('allows user to switch between options', async () => {
      const user = userEvent.setup();
      renderSelectInput({ required: true });

      const select = await screen.findByRole('combobox', { name: /^select$/i });

      await user.selectOptions(select, 'A Option');

      await waitFor(() => {
        expect(select).toHaveValue('A Option');
      });

      await user.selectOptions(select, 'B Option');

      await waitFor(() => {
        expect(select).toHaveValue('B Option');
      });
    });
  });
});

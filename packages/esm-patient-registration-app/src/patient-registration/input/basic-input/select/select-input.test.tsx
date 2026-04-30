import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik, Form } from 'formik';
import { SelectInput } from './select-input.component';

/**
 * Helper to render SelectInput component with Formik.
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

  return render(
    <Formik initialValues={{ select: '', ...initialValues }} onSubmit={() => {}}>
      <Form>
        <SelectInput {...defaultProps} />
      </Form>
    </Formik>,
  );
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
      let formValues: Record<string, string> = {};

      render(
        <Formik initialValues={{ select: '' }} onSubmit={() => {}}>
          {({ values }) => {
            formValues = values as Record<string, string>;
            return (
              <Form>
                <SelectInput name="select" label="Select" options={['A Option', 'B Option']} required />
              </Form>
            );
          }}
        </Formik>,
      );

      const select = await screen.findByRole('combobox');
      await user.selectOptions(select, 'B Option');

      await waitFor(() => {
        expect(formValues.select).toBe('B Option');
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

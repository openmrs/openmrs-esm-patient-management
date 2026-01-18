import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import { TextPersonAttributeField } from './text-person-attribute-field.component';

const mockPersonAttributeType = {
  format: 'java.lang.String',
  display: 'Referred by',
  uuid: '4dd56a75-14ab-4148-8700-1f4f704dc5b0',
  description: 'Referred by',
  name: 'Referred by',
};

/**
 * Helper to render TextPersonAttributeField with Formik for state-dependent tests.
 */
const renderTextPersonAttributeField = (
  props: {
    id?: string;
    label?: string;
    validationRegex?: string;
    required?: boolean;
  } = {},
) => {
  const utils = render(
    <Formik initialValues={{}} onSubmit={() => {}}>
      <Form>
        <TextPersonAttributeField
          id={props.id || 'attributeId'}
          personAttributeType={mockPersonAttributeType}
          label={props.label}
          validationRegex={props.validationRegex}
          required={props.required}
        />
      </Form>
    </Formik>,
  );

  return utils;
};

describe('TextPersonAttributeField', () => {
  it('renders the input field with a label', () => {
    renderTextPersonAttributeField({ label: 'Custom Label' });

    expect(screen.getByRole('textbox', { name: /custom label \(optional\)/i })).toBeInTheDocument();
  });

  it('renders the input field with the default label if label prop is not provided', () => {
    renderTextPersonAttributeField();

    expect(screen.getByRole('textbox', { name: /referred by \(optional\)/i })).toBeInTheDocument();
  });

  describe('Input validation', () => {
    it('validates the input with the provided validationRegex', async () => {
      const user = userEvent.setup();
      const validationRegex = '^[A-Z]+$'; // Accepts only uppercase letters

      renderTextPersonAttributeField({ validationRegex });

      const textbox = screen.getByRole('textbox', { name: /referred by \(optional\)/i });
      expect(textbox).toBeInTheDocument();

      // Valid input: "ABC"
      await user.type(textbox, 'ABC');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid input/i)).not.toBeInTheDocument();
      });
      await user.clear(textbox);

      // Invalid input: "abc" (contains lowercase letters)
      await user.type(textbox, 'abc');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid input/i)).toBeInTheDocument();
      });
    });

    it('does not show error for valid input matching regex', async () => {
      const user = userEvent.setup();
      const validationRegex = '^[A-Z]+$';

      renderTextPersonAttributeField({ validationRegex });

      const textbox = screen.getByRole('textbox', { name: /referred by \(optional\)/i });
      await user.type(textbox, 'VALID');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid input/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Required field', () => {
    it('renders the input field as required when required prop is true', () => {
      renderTextPersonAttributeField({ required: true });
      const textbox = screen.getByRole('textbox', { name: /referred by/i });

      expect(textbox).toBeInTheDocument();
      expect(textbox).toBeRequired();
    });

    it('renders as optional when required prop is false', () => {
      renderTextPersonAttributeField({ required: false });
      const textbox = screen.getByRole('textbox', { name: /referred by \(optional\)/i });

      expect(textbox).toBeInTheDocument();
      expect(textbox).not.toBeRequired();
    });
  });
});

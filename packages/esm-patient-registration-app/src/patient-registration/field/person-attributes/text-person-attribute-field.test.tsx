import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import { createPatternRuleRegistry, PatternRulesProvider } from '../../validation/pattern-rules';
import { getValidationSchema } from '../../validation/patient-registration-validation';
import { validateRegistrationForm } from '../../validation/validate-registration-form';
import { type RegistrationConfig } from '../../../config-schema';
import { type FormValues } from '../../patient-registration.types';
import { TextPersonAttributeField } from './text-person-attribute-field.component';

const validationConfig = {
  freeTextFieldConceptUuid: 'free-text-uuid',
  fieldConfigurations: {
    gender: [{ label: 'M', value: 'male' }],
    identifier: { allowPreferredSelection: false },
  },
} as unknown as RegistrationConfig;

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
  const registry = createPatternRuleRegistry();
  const utils = render(
    <PatternRulesProvider registry={registry}>
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
        validate={(values) =>
          validateRegistrationForm(
            getValidationSchema(
              validationConfig,
              (_key: string, defaultValue: string) => defaultValue,
              registry.getRules,
            ),
            values as FormValues,
          )
        }>
        <Form>
          <TextPersonAttributeField
            id={props.id || 'attributeId'}
            personAttributeType={mockPersonAttributeType}
            label={props.label}
            validationRegex={props.validationRegex}
            required={props.required}
          />
        </Form>
      </Formik>
    </PatternRulesProvider>,
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

  describe('Pattern rule', () => {
    it('registers the regex rule for the attribute', () => {
      const registry = createPatternRuleRegistry();
      render(
        <PatternRulesProvider registry={registry}>
          <Formik initialValues={{}} onSubmit={() => {}}>
            <Form>
              <TextPersonAttributeField
                id="attributeId"
                personAttributeType={mockPersonAttributeType}
                validationRegex="^[A-Z]+$"
              />
            </Form>
          </Formik>
        </PatternRulesProvider>,
      );

      expect(registry.getRules()).toEqual([
        {
          path: `attributes.${mockPersonAttributeType.uuid}`,
          pattern: '^[A-Z]+$',
          message: 'Invalid Input',
          onInvalidPattern: 'throw',
        },
      ]);
    });
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

import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { get } from 'lodash-es';
import { useFormState } from 'react-hook-form';
import { createPatternRuleRegistry, PatternRulesProvider } from '../../validation/pattern-rules';
import { TextPersonAttributeField } from './text-person-attribute-field.component';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import { getMessage, useFormHelpers } from '../../form-adapter';
import type { RegistrationConfig } from '../../../config-schema';
import type { FormValues } from '../../patient-registration.types';

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
 * Helper to render TextPersonAttributeField in a validating registration form for state-dependent tests.
 */
const renderTextPersonAttributeField = (
  props: {
    id?: string;
    label?: string;
    validationRegex?: string;
    required?: boolean;
  } = {},
) =>
  renderWithRegistrationForm(
    <TextPersonAttributeField
      id={props.id || 'attributeId'}
      personAttributeType={mockPersonAttributeType}
      label={props.label}
      validationRegex={props.validationRegex}
      required={props.required}
    />,
    { withValidation: true, config: validationConfig },
  );

const attributeName = `attributes.${mockPersonAttributeType.uuid}`;

/** Shows the form-state error of `name`, so a test can see an error the field does not show. */
const ErrorInFormState: React.FC<{ name: string }> = ({ name }) => {
  const { errors } = useFormState<FormValues>();
  return <span data-testid="error-in-form-state" data-error={getMessage(get(errors, name)) ?? ''} />;
};

/** Touches `name` as the registration form does for every field on submit. */
const TouchAll: React.FC<{ name: string }> = ({ name }) => {
  const { setFieldTouched } = useFormHelpers();
  return (
    <button type="button" onClick={() => setFieldTouched(name, true)}>
      touch all
    </button>
  );
};

describe('TextPersonAttributeField', () => {
  it('names the input after the form path of the attribute', () => {
    renderTextPersonAttributeField();

    expect(screen.getByRole('textbox', { name: /referred by/i })).toHaveAttribute('name', attributeName);
  });

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
      renderWithRegistrationForm(
        <PatternRulesProvider registry={registry}>
          <TextPersonAttributeField
            id="attributeId"
            personAttributeType={mockPersonAttributeType}
            validationRegex="^[A-Z]+$"
          />
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

  describe('Error visibility', () => {
    const renderWithProbe = () =>
      renderWithRegistrationForm(
        <>
          <TextPersonAttributeField
            id="attributeId"
            personAttributeType={mockPersonAttributeType}
            validationRegex="^[A-Z]+$"
          />
          <ErrorInFormState name={attributeName} />
          <TouchAll name={attributeName} />
        </>,
        { initialValues: { attributes: {} }, withValidation: true, config: validationConfig },
      );

    it('shows the regex error only after the field is blurred', async () => {
      const user = userEvent.setup();
      renderWithProbe();

      const textbox = screen.getByRole('textbox', { name: /referred by/i });
      await user.type(textbox, 'abc');

      // Each change validates the whole form, so the error is in form state, but the field is not touched yet.
      await waitFor(() =>
        expect(screen.getByTestId('error-in-form-state')).toHaveAttribute('data-error', 'Invalid Input'),
      );
      expect(screen.queryByText('Invalid Input')).not.toBeInTheDocument();
      expect(textbox).not.toHaveAttribute('aria-invalid', 'true');

      await user.tab();

      expect(await screen.findByText('Invalid Input')).toBeInTheDocument();
      expect(textbox).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows the regex error once the field is touched without a blur, as on submit', async () => {
      const user = userEvent.setup();
      renderWithProbe();

      await user.type(screen.getByRole('textbox', { name: /referred by/i }), 'abc');
      await waitFor(() =>
        expect(screen.getByTestId('error-in-form-state')).toHaveAttribute('data-error', 'Invalid Input'),
      );
      expect(screen.queryByText('Invalid Input')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /touch all/i }));

      expect(await screen.findByText('Invalid Input')).toBeInTheDocument();
    });

    it('touches the attribute path on blur', async () => {
      const user = userEvent.setup();
      const { getTouched } = renderWithProbe();

      await user.click(screen.getByRole('textbox', { name: /referred by/i }));
      await user.tab();

      await waitFor(() => expect(getTouched()).toEqual({ attributes: { [mockPersonAttributeType.uuid]: true } }));
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

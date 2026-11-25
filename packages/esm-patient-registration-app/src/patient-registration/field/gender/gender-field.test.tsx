import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import { initialFormValues } from '../../patient-registration.component';
import { GenderField } from './gender-field.component';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { useFormHelpers } from '../../form-adapter';
import type { FormValues } from '../../patient-registration.types';

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);

/** Marks `gender` touched on click through the form helpers, as the submit does. */
const TouchGenderButton: React.FC = () => {
  const { setFieldTouched } = useFormHelpers();
  return (
    <button type="button" onClick={() => setFieldTouched('gender', true)}>
      Touch gender
    </button>
  );
};

/**
 * Helper to render GenderField in a registration form for state-dependent tests.
 */
const renderGenderFieldInForm = (initialValues: Partial<FormValues> = {}, options?: { withValidation?: boolean }) =>
  renderWithRegistrationForm(<GenderField />, {
    initialValues: { gender: '', ...initialValues },
    withValidation: options?.withValidation,
  });

/**
 * Helper to render GenderField with mocked form functions (for simple rendering tests).
 */
const renderGenderField = (initialValues: Partial<FormValues> = {}) => {
  const defaultValues = {
    gender: '',
    ...initialValues,
  };

  return renderWithRegistrationForm(<GenderField />, {
    initialValues: defaultValues,
    contextValues: {
      values: { ...initialFormValues, ...defaultValues } as FormValues,
      setFieldValue: vi.fn().mockResolvedValue(undefined),
      setFieldTouched: vi.fn().mockResolvedValue(undefined),
      initialFormValues: { ...initialFormValues, ...defaultValues } as FormValues,
    },
  });
};

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
          {
            value: 'other',
            label: 'Other',
          },
          {
            value: 'unknown',
            label: 'Unknown',
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

  it('renders the gender field with all options', () => {
    renderGenderField();

    expect(screen.getByRole('heading', { name: /sex/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^male/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/female/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/other/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unknown/i)).toBeInTheDocument();
  });

  describe('Gender selection', () => {
    it('updates form value when user selects female', async () => {
      const user = userEvent.setup();
      const { getValues } = renderGenderFieldInForm({ gender: 'male' });

      await user.click(screen.getByText(/female/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/female/i)).toBeChecked();
      });
      expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
      expect(getValues().gender).toBe('female');
    });

    it('updates form value when user selects male', async () => {
      const user = userEvent.setup();
      const { getValues } = renderGenderFieldInForm({ gender: 'female' });

      await user.click(screen.getByText(/^male/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/^male/i)).toBeChecked();
      });
      expect(screen.getByLabelText(/female/i)).not.toBeChecked();
      expect(getValues().gender).toBe('male');
    });

    it('updates form value when user selects other', async () => {
      const user = userEvent.setup();
      const { getValues } = renderGenderFieldInForm();

      await user.click(screen.getByText(/other/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/other/i)).toBeChecked();
      });
      expect(getValues().gender).toBe('other');
    });

    it('updates form value when user selects unknown', async () => {
      const user = userEvent.setup();
      const { getValues } = renderGenderFieldInForm({ gender: 'male' });

      await user.click(screen.getByText(/unknown/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/unknown/i)).toBeChecked();
      });
      expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
      expect(getValues().gender).toBe('unknown');
    });

    it('displays the initial gender value correctly', () => {
      renderGenderFieldInForm({ gender: 'female' });

      expect(screen.getByLabelText(/female/i)).toBeChecked();
      expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
    });

    it('allows switching between all gender options', async () => {
      const user = userEvent.setup();
      const { getValues } = renderGenderFieldInForm();

      // Select male
      await user.click(screen.getByText(/^male/i));
      await waitFor(() => {
        expect(getValues().gender).toBe('male');
      });

      // Switch to female
      await user.click(screen.getByText(/female/i));
      await waitFor(() => {
        expect(getValues().gender).toBe('female');
      });

      // Switch to other
      await user.click(screen.getByText(/other/i));
      await waitFor(() => {
        expect(getValues().gender).toBe('other');
      });

      // Switch to unknown
      await user.click(screen.getByText(/unknown/i));
      await waitFor(() => {
        expect(getValues().gender).toBe('unknown');
      });
    });
  });

  describe('Validation error display', () => {
    it('does not show error when field is not touched', () => {
      renderGenderFieldInForm({ gender: '' }, { withValidation: true });

      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();
    });

    it('shows error message when user selects a gender and then form is validated', async () => {
      const user = userEvent.setup();
      const { getValues } = renderGenderFieldInForm({ gender: '' }, { withValidation: true });

      // Initially no error (field not touched)
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();

      // User selects a valid gender - this marks field as touched
      await user.click(screen.getByText(/^male/i));

      await waitFor(() => {
        expect(getValues().gender).toBe('male');
      });

      // After valid selection, no error should appear (user-visible)
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/^male/i)).toBeChecked();
    });

    it('clears error message when valid gender is selected', async () => {
      const user = userEvent.setup();
      renderGenderFieldInForm({ gender: '' }, { withValidation: true });

      // Initially no error (field not touched)
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();

      // Select a valid gender option - this will mark field as touched
      await user.click(screen.getByText(/^male/i));

      // Wait for selection to be applied (user-visible)
      await waitFor(() => {
        expect(screen.getByLabelText(/^male/i)).toBeChecked();
      });

      // Error should not appear after valid selection (user-visible)
      expect(screen.queryByText(/gender is required/i)).not.toBeInTheDocument();
    });

    it('shows the error of an empty sex once the field is touched', async () => {
      const user = userEvent.setup();
      renderWithRegistrationForm(
        <>
          <GenderField />
          <TouchGenderButton />
        </>,
        { initialValues: { gender: '' }, withValidation: true },
      );

      expect(screen.queryByText('Gender is required')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Touch gender' }));

      expect(await screen.findByText('Gender is required')).toBeInTheDocument();
    });
  });

  describe('Form state', () => {
    it('marks the field touched when a sex is selected', async () => {
      const user = userEvent.setup();
      const { getValues, getTouched } = renderGenderFieldInForm();

      expect(getTouched().gender).toBeUndefined();

      await user.click(screen.getByText(/female/i));

      expect(getValues().gender).toBe('female');
      expect(getTouched().gender).toBe(true);
    });

    it('shows a value set from outside the field', async () => {
      const user = userEvent.setup();
      const SetGenderButton: React.FC = () => {
        const { setFieldValue } = useFormHelpers();
        return (
          <button type="button" onClick={() => setFieldValue('gender', 'other')}>
            Set gender
          </button>
        );
      };
      renderWithRegistrationForm(
        <>
          <GenderField />
          <SetGenderButton />
        </>,
        { initialValues: { gender: 'male' } },
      );

      await user.click(screen.getByRole('button', { name: 'Set gender' }));

      await waitFor(() => expect(screen.getByLabelText(/other/i)).toBeChecked());
      expect(screen.getByLabelText(/^male/i)).not.toBeChecked();
    });
  });
});

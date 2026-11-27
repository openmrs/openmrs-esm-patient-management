import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { useConceptAnswers } from '../field.resource';
import { CauseOfDeathField } from './cause-of-death.component';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import type { FormValues } from '../../patient-registration.types';

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);
const mockUseConceptAnswers = vi.mocked(useConceptAnswers);

vi.mock('../field.resource', async () => ({
  ...((await vi.importActual('../field.resource')) as object),
  useConceptAnswers: vi.fn(),
}));

const mockConceptAnswers = [
  { display: 'Cardiac Arrest', uuid: 'cardiac-uuid' },
  { display: 'Pneumonia', uuid: 'pneumonia-uuid' },
  { display: 'Other', uuid: 'other-uuid' },
];

/**
 * Helper to render CauseOfDeathField in a registration form for state-dependent tests.
 */
const renderCauseOfDeathFieldInForm = (initialValues: Partial<FormValues> = {}) => {
  const defaultValues = {
    deathCause: '',
    nonCodedCauseOfDeath: '',
    ...initialValues,
  };

  return renderWithRegistrationForm(<CauseOfDeathField />, { initialValues: defaultValues });
};

describe('CauseOfDeathField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        causeOfDeath: {
          conceptUuid: 'cause-of-death-uuid',
          required: false,
        },
      } as RegistrationConfig['fieldConfigurations'],
      freeTextFieldConceptUuid: 'other-uuid',
    } as RegistrationConfig);
    mockUseConceptAnswers.mockReturnValue({
      data: mockConceptAnswers,
      isLoading: false,
      error: null,
    });
  });

  it('renders the cause of death field with label', () => {
    renderCauseOfDeathFieldInForm();

    expect(screen.getByRole('heading', { name: /cause of death/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /cause of death/i })).toBeInTheDocument();
  });

  it('displays loading skeleton when concept answers are loading', () => {
    mockUseConceptAnswers.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderCauseOfDeathFieldInForm();

    // SelectSkeleton renders as a skeleton element, check for the skeleton class
    expect(screen.getByText(/cause of death/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('displays error notification when concept UUID is not configured', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        causeOfDeath: {
          conceptUuid: null,
          required: false,
        },
      } as RegistrationConfig['fieldConfigurations'],
    });

    renderCauseOfDeathFieldInForm();

    expect(screen.getByText(/error fetching coded causes of death/i)).toBeInTheDocument();
  });

  it('displays error notification when there is an error loading concept answers', () => {
    mockUseConceptAnswers.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    renderCauseOfDeathFieldInForm();

    expect(screen.getByText(/error fetching coded causes of death/i)).toBeInTheDocument();
  });

  describe('Cause of death selection', () => {
    it('renders all available cause of death options', () => {
      renderCauseOfDeathFieldInForm();

      expect(screen.getByRole('option', { name: /cardiac arrest/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /pneumonia/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /other/i })).toBeInTheDocument();
    });

    it('updates form value when user selects a cause of death', async () => {
      const user = userEvent.setup();
      const { getValues } = renderCauseOfDeathFieldInForm();

      const select = screen.getByRole('combobox', { name: /cause of death/i }) as HTMLSelectElement;
      await user.selectOptions(select, 'cardiac-uuid');

      await waitFor(() => {
        expect(getValues().deathCause).toBe('cardiac-uuid');
      });
      expect(select.value).toBe('cardiac-uuid');
    });

    it('shows non-coded cause of death input when "Other" is selected', async () => {
      const user = userEvent.setup();
      const { getValues } = renderCauseOfDeathFieldInForm();

      const select = screen.getByRole('combobox', { name: /cause of death/i }) as HTMLSelectElement;
      await user.selectOptions(select, 'other-uuid');

      await waitFor(() => {
        expect(getValues().deathCause).toBe('other-uuid');
      });

      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /non-coded cause of death/i })).toBeInTheDocument();
      });
    });

    it('hides non-coded cause of death input when non-other option is selected', async () => {
      const user = userEvent.setup();
      const { getValues } = renderCauseOfDeathFieldInForm({ deathCause: 'other-uuid' });

      // Wait for non-coded input to appear (component checks deathCause.value)
      await waitFor(() => {
        expect(screen.getByRole('textbox', { name: /non-coded cause of death/i })).toBeInTheDocument();
      });

      // Select a different option
      const select = screen.getByRole('combobox', { name: /cause of death/i }) as HTMLSelectElement;
      await user.selectOptions(select, 'cardiac-uuid');

      await waitFor(() => {
        expect(getValues().deathCause).toBe('cardiac-uuid');
      });

      // Non-coded input should be hidden
      await waitFor(() => {
        expect(screen.queryByRole('textbox', { name: /non-coded cause of death/i })).not.toBeInTheDocument();
      });
    });

    it('allows user to enter non-coded cause of death text', async () => {
      const user = userEvent.setup();
      const { getValues } = renderCauseOfDeathFieldInForm({ deathCause: 'other-uuid' });

      // Wait for non-coded input to appear
      const textInput = await screen.findByRole('textbox', { name: /non-coded cause of death/i });
      await user.type(textInput, 'Unknown cause');

      await waitFor(() => {
        expect(getValues().nonCodedCauseOfDeath).toBe('Unknown cause');
      });
    });
  });

  describe('Required field', () => {
    it('renders as required when configured', () => {
      mockUseConfig.mockReturnValue({
        ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
        fieldConfigurations: {
          causeOfDeath: {
            conceptUuid: 'cause-of-death-uuid',
            required: true,
          },
        } as RegistrationConfig['fieldConfigurations'],
        freeTextFieldConceptUuid: 'other-uuid',
      } as RegistrationConfig);

      renderCauseOfDeathFieldInForm();

      const select = screen.getByRole('combobox', { name: /cause of death/i });
      expect(select).toBeRequired();
    });

    it('renders as optional when not required', () => {
      renderCauseOfDeathFieldInForm();

      const select = screen.getByRole('combobox', { name: /cause of death/i });
      expect(select).not.toBeRequired();
    });
  });
});

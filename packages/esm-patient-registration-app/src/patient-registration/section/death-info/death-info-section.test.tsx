import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useFormState } from 'react-hook-form';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { DeathInfoSection } from './death-info-section.component';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import { useFormHelpers } from '../../form-adapter';
import type { FormValues } from '../../patient-registration.types';

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);

/**
 * Helper to render DeathInfoSection in a registration form for state-dependent tests.
 */
function renderDeathInfoSectionInForm(fields: string[] = [], initialValues: Partial<FormValues> = {}) {
  const defaultValues = {
    isDead: false,
    ...initialValues,
  };

  return renderWithRegistrationForm(<DeathInfoSection fields={fields} />, {
    initialValues: defaultValues,
    contextValues: { setFieldTouched: vi.fn().mockResolvedValue(undefined) },
  });
}

describe('Death info section', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldDefinitions: [],
    });
  });

  describe('Rendering', () => {
    it('renders the section with checkbox', () => {
      renderDeathInfoSectionInForm();

      expect(screen.getByRole('region', { name: /death info section/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /is dead/i })).toBeInTheDocument();
    });

    it('shows checkbox as checked when isDead is true', () => {
      renderDeathInfoSectionInForm([], { isDead: true });

      const checkbox = screen.getByRole('checkbox', { name: /is dead/i });
      expect(checkbox).toBeChecked();
    });

    it('shows checkbox as unchecked when isDead is false', () => {
      renderDeathInfoSectionInForm([], { isDead: false });

      const checkbox = screen.getByRole('checkbox', { name: /is dead/i });
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('User interaction', () => {
    it('toggles death info fields when user clicks the checkbox', async () => {
      const user = userEvent.setup();
      const { getValues } = renderDeathInfoSectionInForm([]);

      const checkbox = screen.getByRole('checkbox', { name: /is dead/i });
      expect(checkbox).not.toBeChecked();

      // Click to check
      await user.click(checkbox);

      await waitFor(() => {
        expect(getValues().isDead).toBe(true);
      });

      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      // Click to uncheck
      await user.click(checkbox);

      await waitFor(() => {
        expect(getValues().isDead).toBe(false);
      });

      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
    });

    it('updates form values when user toggles the checkbox', async () => {
      const user = userEvent.setup();
      const { getValues } = renderDeathInfoSectionInForm([]);

      const checkbox = screen.getByRole('checkbox', { name: /is dead/i });
      expect(checkbox).not.toBeChecked();
      expect(getValues().isDead).toBe(false);

      // Check the checkbox
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
      expect(getValues().isDead).toBe(true);

      // Uncheck the checkbox
      await user.click(checkbox);
      await waitFor(() => {
        expect(checkbox).not.toBeChecked();
      });
      expect(getValues().isDead).toBe(false);
    });
  });

  describe('Form state', () => {
    it('writes isDead and shows the death fields when the box is checked', async () => {
      const user = userEvent.setup();
      const { getValues } = renderDeathInfoSectionInForm(['dateAndTimeOfDeath']);

      expect(screen.queryByRole('heading', { name: /date of death/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole('checkbox', { name: /is dead/i }));

      expect(getValues().isDead).toBe(true);
      expect(await screen.findByRole('heading', { name: /date of death/i })).toBeInTheDocument();
    });

    it('validates the form when the box is checked', async () => {
      const user = userEvent.setup();
      const DeathDateErrorProbe: React.FC = () => {
        const { errors } = useFormState<FormValues>({ name: 'deathDate' });
        return <output aria-label="Death date error">{errors.deathDate?.message as string}</output>;
      };
      renderWithRegistrationForm(
        <>
          <DeathInfoSection fields={[]} />
          <DeathDateErrorProbe />
        </>,
        { initialValues: { isDead: false, deathDate: '' }, withValidation: true },
      );

      expect(screen.getByRole('status', { name: 'Death date error' })).toBeEmptyDOMElement();

      await user.click(screen.getByRole('checkbox', { name: /is dead/i }));

      await waitFor(() =>
        expect(screen.getByRole('status', { name: 'Death date error' })).toHaveTextContent('Death date is required'),
      );
    });

    it('shows and hides the death fields when isDead is set from outside', async () => {
      const user = userEvent.setup();
      const SetIsDeadButtons: React.FC = () => {
        const { setFieldValue } = useFormHelpers();
        return (
          <>
            <button type="button" onClick={() => setFieldValue('isDead', true)}>
              Set dead
            </button>
            <button type="button" onClick={() => setFieldValue('isDead', false)}>
              Set alive
            </button>
          </>
        );
      };
      renderWithRegistrationForm(
        <>
          <DeathInfoSection fields={['dateAndTimeOfDeath']} />
          <SetIsDeadButtons />
        </>,
        { initialValues: { isDead: false } },
      );

      await user.click(screen.getByRole('button', { name: 'Set dead' }));

      expect(await screen.findByRole('heading', { name: /date of death/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /is dead/i })).toBeChecked();

      await user.click(screen.getByRole('button', { name: 'Set alive' }));

      await waitFor(() => expect(screen.queryByRole('heading', { name: /date of death/i })).not.toBeInTheDocument());
      expect(screen.getByRole('checkbox', { name: /is dead/i })).not.toBeChecked();
    });
  });
});

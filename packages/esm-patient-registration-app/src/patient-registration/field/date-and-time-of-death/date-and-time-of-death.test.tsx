import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { getDefaultsFromConfigSchema, OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { DateAndTimeOfDeathField } from './date-and-time-of-death.component';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import type { FormValues } from '../../patient-registration.types';

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);

/**
 * Helper to render DateAndTimeOfDeathField in a registration form for state-dependent tests.
 */
const renderDateAndTimeOfDeathFieldInForm = (initialValues: Partial<FormValues> = {}, withValidation = false) => {
  const defaultValues = {
    deathDate: '',
    deathTime: '',
    deathTimeFormat: 'AM' as const,
    isDead: false,
    ...initialValues,
  };

  return renderWithRegistrationForm(<DateAndTimeOfDeathField />, { initialValues: defaultValues, withValidation });
};

describe('DateAndTimeOfDeathField', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
    });
  });

  it('renders the date and time of death field with label', () => {
    renderDateAndTimeOfDeathFieldInForm();

    expect(screen.getByRole('heading', { name: /date of death/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/date of death/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of death/i)).toBeInTheDocument();
  });

  describe('Date of death', () => {
    it('sets death date when user enters a date', async () => {
      const { getValues } = renderDateAndTimeOfDeathFieldInForm({ isDead: true });

      const dateInput = screen.getByLabelText(/date of death/i) as HTMLInputElement;
      const deathDateString = '2020-01-15';

      fireEvent.change(dateInput, { target: { value: deathDateString } });
      fireEvent.blur(dateInput);

      await waitFor(() => {
        expect(getValues().deathDate).toBeTruthy();
      });
    });

    it('does not show the required error when a date segment is blurred, as under Formik', async () => {
      // The framework mock of OpenmrsDatePicker drops `onBlur`. The real picker passes it to its date segments, which
      // have a generated id and no name.
      const originalImplementation = vi.mocked(OpenmrsDatePicker).getMockImplementation();
      vi.mocked(OpenmrsDatePicker).mockImplementation(
        ({
          onBlur,
          invalid,
          invalidText,
        }: {
          onBlur?: (event: unknown) => void;
          invalid?: boolean;
          invalidText?: string;
        }) => (
          <>
            <span role="spinbutton" aria-label="day" id="react-aria-segment" tabIndex={0} onBlur={onBlur} />
            {invalid && <span>{invalidText}</span>}
          </>
        ),
      );
      try {
        const user = userEvent.setup();
        renderDateAndTimeOfDeathFieldInForm({ isDead: true }, true);

        await user.click(screen.getByRole('spinbutton', { name: 'day' }));
        await user.tab();

        await waitFor(() => expect(screen.getByRole('spinbutton', { name: 'day' })).not.toHaveFocus());
        expect(screen.queryByText(/death date is required/i)).not.toBeInTheDocument();
      } finally {
        vi.mocked(OpenmrsDatePicker).mockImplementation(originalImplementation);
      }
    });

    it('renders date picker when isDead is true', () => {
      renderDateAndTimeOfDeathFieldInForm({ isDead: true });

      // Verify date picker is rendered (OpenmrsDatePicker uses isRequired prop, not HTML required attribute)
      const dateInput = screen.getByLabelText(/date of death/i);
      expect(dateInput).toBeInTheDocument();
    });

    it('renders date picker when isDead is false', () => {
      renderDateAndTimeOfDeathFieldInForm({ isDead: false });

      const dateInput = screen.getByLabelText(/date of death/i);
      expect(dateInput).toBeInTheDocument();
    });
  });

  describe('Time of death', () => {
    it('allows user to enter time of death', async () => {
      const user = userEvent.setup();
      const { getValues } = renderDateAndTimeOfDeathFieldInForm();

      const timeInput = screen.getByLabelText(/time of death/i) as HTMLInputElement;
      await user.type(timeInput, '10:30');

      await waitFor(() => {
        expect(getValues().deathTime).toBe('10:30');
      });
    });

    it('allows user to select AM/PM format', async () => {
      const user = userEvent.setup();
      const { getValues } = renderDateAndTimeOfDeathFieldInForm();

      // TimePickerSelect uses aria-label, find by that
      const formatSelect = screen.getByLabelText(/time format/i) as HTMLSelectElement;
      await user.selectOptions(formatSelect, 'PM');

      await waitFor(() => {
        expect(getValues().deathTimeFormat).toBe('PM');
      });
    });

    it('displays the initial time format value correctly', () => {
      renderDateAndTimeOfDeathFieldInForm({ deathTimeFormat: 'PM' });

      const formatSelect = screen.getByLabelText(/time format/i) as HTMLSelectElement;
      expect(formatSelect.value).toBe('PM');
    });
  });
});

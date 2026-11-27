import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, screen, waitFor, fireEvent } from '@testing-library/react';
import { getDefaultsFromConfigSchema, OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { DateAndTimeOfDeathField } from './date-and-time-of-death.component';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import { useFormHelpers } from '../../form-adapter';
import type { FormValues } from '../../patient-registration.types';

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);

/** Touches a field or sets `isDead` on click through the form helpers, as the submit and the death info section do. */
const OutsideButtons: React.FC = () => {
  const { setFieldTouched, setFieldValue } = useFormHelpers();
  return (
    <>
      <button type="button" onClick={() => setFieldTouched('deathDate', true)}>
        Touch death date
      </button>
      <button type="button" onClick={() => setFieldValue('isDead', true)}>
        Set dead
      </button>
      <button type="button" onClick={() => setFieldValue('isDead', false)}>
        Set alive
      </button>
    </>
  );
};

const renderWithOutsideButtons = (initialValues: Partial<FormValues>) =>
  renderWithRegistrationForm(
    <>
      <DateAndTimeOfDeathField />
      <OutsideButtons />
    </>,
    {
      initialValues: { deathDate: '', deathTime: '', deathTimeFormat: 'AM', isDead: false, ...initialValues },
      withValidation: true,
    },
  );

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

    it('writes local midnight of the picked date', async () => {
      const { getValues } = renderDateAndTimeOfDeathFieldInForm({ isDead: true });

      fireEvent.change(screen.getByLabelText(/date of death/i), { target: { value: '2020-01-15T13:45:30' } });

      await waitFor(() => expect(getValues().deathDate).toEqual(new Date(2020, 0, 15, 0, 0, 0, 0)));
    });

    it('shows the required error only once the death date is touched', async () => {
      const user = userEvent.setup();
      renderWithOutsideButtons({ isDead: true });

      // A change elsewhere validates the whole form, so deathDate has its error but is not touched yet.
      await user.type(screen.getByLabelText(/time of death/i), '1');
      await waitFor(() => expect(screen.getByLabelText(/time of death/i)).toHaveValue('1'));
      expect(screen.queryByText('Death date is required')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Touch death date' }));

      expect(await screen.findByText('Death date is required')).toBeInTheDocument();
    });

    it('passes the field name, value and blur handler, and isDead as isRequired, to the date picker', async () => {
      const user = userEvent.setup();
      const deathDate = new Date(2020, 0, 15);
      renderWithOutsideButtons({ deathDate });

      let props = vi.mocked(OpenmrsDatePicker).mock.lastCall[0];
      expect(props.name).toBe('deathDate');
      expect(props.value).toEqual(deathDate);
      expect(props.id).toBe('deathDate');
      expect(typeof props.onBlur).toBe('function');
      expect(props.isRequired).toBe(false);
      expect(props.invalid).toBe(false);
      expect(props.invalidText).toBeUndefined();

      await user.click(screen.getByRole('button', { name: 'Set dead' }));
      await waitFor(() => expect(vi.mocked(OpenmrsDatePicker).mock.lastCall[0].isRequired).toBe(true));

      await user.click(screen.getByRole('button', { name: 'Set alive' }));
      await waitFor(() => expect(vi.mocked(OpenmrsDatePicker).mock.lastCall[0].isRequired).toBe(false));
      props = vi.mocked(OpenmrsDatePicker).mock.lastCall[0];
      expect(props.value).toEqual(deathDate);
    });

    it("touches the blurred element's name through the date picker's onBlur, as Formik's handleBlur", async () => {
      const { getTouched } = renderWithOutsideButtons({ isDead: true });

      // A target name other than the field's own shows that the target decides what is touched.
      act(() => vi.mocked(OpenmrsDatePicker).mock.lastCall[0].onBlur({ target: { name: 'deathTime' } }));

      await waitFor(() => expect(getTouched().deathTime).toBe(true));
      expect(getTouched().deathDate).toBeUndefined();
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

    it('writes the typed time as is and touches deathTime on blur', async () => {
      const user = userEvent.setup();
      const { getValues, getTouched } = renderDateAndTimeOfDeathFieldInForm();

      const timeInput = screen.getByLabelText(/time of death/i);
      expect(timeInput).toHaveAttribute('name', 'deathTime');
      await user.type(timeInput, '07:5');
      expect(getTouched().deathTime).toBeUndefined();
      await user.tab();

      await waitFor(() => expect(getTouched().deathTime).toBe(true));
      expect(getValues().deathTime).toBe('07:5');
    });

    it('shows the format error of an invalid time once the time is touched', async () => {
      const user = userEvent.setup();
      renderDateAndTimeOfDeathFieldInForm({ isDead: true }, true);

      const timeInput = screen.getByLabelText(/time of death/i);
      await user.type(timeInput, '13:99');
      await waitFor(() => expect(timeInput).toHaveValue('13:99'));
      expect(screen.queryByText("Time doesn't match the format 'hh:mm'")).not.toBeInTheDocument();

      await user.tab();

      expect(await screen.findByText("Time doesn't match the format 'hh:mm'")).toBeInTheDocument();
    });

    it('writes the time format and touches deathTimeFormat on blur', async () => {
      const user = userEvent.setup();
      const { getValues, getTouched } = renderDateAndTimeOfDeathFieldInForm();

      const formatSelect = screen.getByLabelText(/time format/i);
      expect(formatSelect).toHaveAttribute('name', 'deathTimeFormat');
      await user.selectOptions(formatSelect, 'PM');
      expect(getValues().deathTimeFormat).toBe('PM');
      expect(getTouched().deathTimeFormat).toBeUndefined();

      await user.tab();

      await waitFor(() => expect(getTouched().deathTimeFormat).toBe(true));
    });

    it('displays the initial time format value correctly', () => {
      renderDateAndTimeOfDeathFieldInForm({ deathTimeFormat: 'PM' });

      const formatSelect = screen.getByLabelText(/time format/i) as HTMLSelectElement;
      expect(formatSelect.value).toBe('PM');
    });
  });
});

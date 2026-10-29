import { describe, expect, it } from 'vitest';
import { appointmentScheduleErrorText } from './appointment-schedule-error';

const messages = {
  fallback: 'The appointment could not be scheduled. Please check the appointment details and try again.',
  withReason: (reason: string) => `Unable to schedule appointment: ${reason}`,
};

const fallback = 'The appointment could not be scheduled. Please check the appointment details and try again.';
const rawFetchError =
  'Server responded with 400 () for url /openmrs/ws/rest/v1/appointment. Check err.responseBody or network tab for details';

describe('appointmentScheduleErrorText', () => {
  it('shows the server validation message and not the raw fetch error', () => {
    expect(
      appointmentScheduleErrorText(
        {
          message: rawFetchError,
          responseBody: { error: { message: '[Appointment start date time should be after current date]' } },
        },
        messages,
      ),
    ).toBe('Unable to schedule appointment: Appointment start date time should be after current date');
  });

  it('uses the fallback when the response has no safe reason', () => {
    expect(appointmentScheduleErrorText({ message: rawFetchError }, messages)).toBe(fallback);
    expect(appointmentScheduleErrorText({ responseBody: {} }, messages)).toBe(fallback);
    expect(appointmentScheduleErrorText({ responseBody: { error: { message: '<b>not safe</b>' } } }, messages)).toBe(
      fallback,
    );
    expect(
      appointmentScheduleErrorText(
        { responseBody: { error: { message: 'APIAuthenticationException: denied' } } },
        messages,
      ),
    ).toBe(fallback);
  });

  it('uses the first field error when the top-level message is empty', () => {
    expect(
      appointmentScheduleErrorText(
        { responseBody: { error: { fieldErrors: { startDateTime: [{ message: 'Start date is required' }] } } } },
        messages,
      ),
    ).toBe('Unable to schedule appointment: Start date is required');
  });
});

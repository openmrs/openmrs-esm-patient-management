import React from 'react';
import dayjs from 'dayjs';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { mockQueueEntryAlice } from '__mocks__';
import { type QueueEntry } from '../../types';
import { QueueTablePatientAgeCell } from './queue-table-patient-age-cell.component';

function renderAgeCell(birthdate: string | undefined) {
  const queueEntry = {
    ...mockQueueEntryAlice,
    patient: {
      ...mockQueueEntryAlice.patient,
      person: { ...mockQueueEntryAlice.patient.person, birthdate },
    },
  } as QueueEntry;

  return render(<QueueTablePatientAgeCell queueEntry={queueEntry} />);
}

describe('QueueTablePatientAgeCell', () => {
  it('shows the age in years for an adult', () => {
    const { container } = renderAgeCell(dayjs().subtract(40, 'year').subtract(1, 'day').format('YYYY-MM-DD'));

    expect(container).toHaveTextContent('40 yrs');
  });

  it('shows weeks for a patient under a year old instead of 0', () => {
    const { container } = renderAgeCell(dayjs().subtract(10, 'week').format('YYYY-MM-DD'));

    expect(container).toHaveTextContent(/^10 wks$/);
  });

  it('shows nothing when the patient has no birthdate', () => {
    const { container } = renderAgeCell(undefined);

    expect(container).toHaveTextContent('');
    expect(container).not.toHaveTextContent('0');
  });
});

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { type Encounter } from '../../types';
import WardPatientTimeSinceAdmission from './ward-patient-time-since-admission.component';

describe('WardPatientTimeSinceAdmission', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T10:05:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the time since admission current while the card stays on screen', () => {
    const encounter = { encounterDatetime: '2026-10-23T10:00:00Z' } as Encounter;
    render(<WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={encounter} />);

    expect(screen.getByText('Admitted: 5 minutes ago')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText('Admitted: 6 minutes ago')).toBeInTheDocument();
  });
});

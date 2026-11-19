import React from 'react';
import { act, render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { type Encounter } from '@openmrs/esm-framework';
import WardPatientTimeOnWard from './ward-patient-time-on-ward.component';

describe('WardPatientTimeOnWard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-23T10:05:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps the time on the ward current while the card stays on screen', () => {
    // The react-i18next mock does not format plural defaults, so check the count passed to t() instead of the text.
    const t = vi.spyOn(useTranslation(), 't');
    const encounter = { encounterDatetime: '2026-10-23T10:00:00Z' } as Encounter;
    render(<WardPatientTimeOnWard encounterAssigningToCurrentInpatientLocation={encounter} />);

    expect(t).toHaveBeenCalledWith('minutes', expect.objectContaining({ count: 5 }));

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(t).toHaveBeenCalledWith('minutes', expect.objectContaining({ count: 6 }));
  });
});

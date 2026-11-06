import React from 'react';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import { getLocale } from '@openmrs/esm-framework';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { type Encounter } from '../../types';
import WardPatientTimeSinceAdmission, { formatTimeAgo } from './ward-patient-time-since-admission.component';

const mockGetLocale = vi.mocked(getLocale);

describe('WardPatientTimeSinceAdmission', () => {
  afterEach(() => mockGetLocale.mockReturnValue('en'));

  it('shows the time since admission in the session locale', () => {
    mockGetLocale.mockReturnValue('fr');
    const encounter = {
      encounterDatetime: dayjs().subtract(2, 'hour').subtract(5, 'minute').toISOString(),
    } as Encounter;

    render(<WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={encounter} />);

    expect(screen.getByText('Admitted: il y a 2 heures')).toBeInTheDocument();
  });

  it('renders nothing without an admission or transfer encounter', () => {
    const { container } = render(<WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('formatTimeAgo', () => {
  const now = dayjs('2026-01-15T12:00:00Z');

  it('uses the largest whole unit', () => {
    expect(formatTimeAgo(now.subtract(30, 'second'), now)).toBe('30 seconds ago');
    expect(formatTimeAgo(now.subtract(5, 'minute'), now)).toBe('5 minutes ago');
    expect(formatTimeAgo(now.subtract(1, 'day'), now)).toBe('yesterday');
    expect(formatTimeAgo(now.subtract(3, 'week'), now)).toBe('3 weeks ago');
    expect(formatTimeAgo(now.subtract(2, 'month'), now)).toBe('2 months ago');
  });

  it('formats in the session locale', () => {
    mockGetLocale.mockReturnValue('fr');

    expect(formatTimeAgo(now.subtract(30, 'second'), now)).toBe('il y a 30 secondes');
    expect(formatTimeAgo(now.subtract(3, 'day'), now)).toBe('il y a 3 jours');
  });
});

import React from 'react';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { type Encounter } from '../../types';
import WardPatientTimeSinceAdmission from './ward-patient-time-since-admission.component';

describe('WardPatientTimeSinceAdmission', () => {
  it('shows the time since admission', () => {
    const encounter = {
      encounterDatetime: dayjs().subtract(2, 'hour').subtract(5, 'minute').toISOString(),
    } as Encounter;

    render(<WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={encounter} />);

    expect(screen.getByText('Time since admission: 2 hours')).toBeInTheDocument();
  });

  it('renders nothing without an admission or transfer encounter', () => {
    const { container } = render(<WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});

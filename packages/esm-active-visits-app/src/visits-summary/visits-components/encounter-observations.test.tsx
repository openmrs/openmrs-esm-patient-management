import React from 'react';
import { render, screen } from '@testing-library/react';
import { type Observation } from '../visit.resource';
import EncounterObservations from './encounter-observations.component';

describe('EncounterObservations', () => {
  test('renders skeleton text while loading', () => {
    render(<EncounterObservations observations={null} />);

    expect(screen.queryByText('Temperature')).not.toBeInTheDocument();
  });

  test('renders "No observations found" message when observations list is empty', () => {
    const emptyObservations = [];
    render(<EncounterObservations observations={emptyObservations} />);

    expect(screen.getByText('No observations found')).toBeInTheDocument();
  });

  test('renders observations list correctly', () => {
    const observations = [
      { display: 'Temperature: 98.6°F' },
      { display: 'Blood Pressure: 120/80 mmHg' },
      { display: 'Heart Rate: 72 bpm' },
    ] as Array<Observation>;
    render(<EncounterObservations observations={observations} />);

    expect(screen.getByText('Temperature:')).toBeInTheDocument();
    expect(screen.getByText('98.6°F')).toBeInTheDocument();

    expect(screen.getByText('Blood Pressure:')).toBeInTheDocument();
    expect(screen.getByText('120/80 mmHg')).toBeInTheDocument();

    expect(screen.getByText('Heart Rate:')).toBeInTheDocument();
    expect(screen.getByText('72 bpm')).toBeInTheDocument();
  });
});

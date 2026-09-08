import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServicesLegend from './services-legend.component';

describe('ServicesLegend', () => {
  const OUTPATIENT_SERVICE = { uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90', name: 'Outpatient' };
  const HIV_CLINIC_SERVICE = { uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1', name: 'HIV Clinic' };
  const TB_CLINIC_SERVICE = { uuid: '4a228e52-0bfe-11ed-861d-0242ac120002', name: 'TB Clinic' };

  it('shows nothing when there are no services', () => {
    render(<ServicesLegend services={[]} />);
    expect(screen.getByTestId('services-legend')).toBeEmptyDOMElement();
    expect(screen.queryByText('Services')).not.toBeInTheDocument();
  });

  it('shows the section title and one row per service, each with the correct service name', () => {
    const services = [OUTPATIENT_SERVICE, HIV_CLINIC_SERVICE];
    render(<ServicesLegend services={services} />);

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Outpatient')).toBeInTheDocument();
    expect(screen.getByText('HIV Clinic')).toBeInTheDocument();
  });

  it("shows each service row with a color swatch in that service's color", () => {
    const services = [OUTPATIENT_SERVICE, HIV_CLINIC_SERVICE];
    const serviceColorMap = new Map([
      [OUTPATIENT_SERVICE.uuid, '#73A947'],
      [HIV_CLINIC_SERVICE.uuid, '#1990DC'],
    ]);

    render(<ServicesLegend services={services} serviceColorMap={serviceColorMap} />);

    expect(screen.getByTestId('legend-swatch-e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90')).toHaveStyle({
      backgroundColor: '#73A947',
    });
    expect(screen.getByTestId('legend-swatch-53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1')).toHaveStyle({
      backgroundColor: '#1990DC',
    });
  });

  it('does not crash and shows a blank swatch when a service has no color assigned', () => {
    render(<ServicesLegend services={[TB_CLINIC_SERVICE]} />);
    expect(screen.getByText('TB Clinic')).toBeInTheDocument();
    expect(screen.getByTestId('legend-swatch-4a228e52-0bfe-11ed-861d-0242ac120002')).toBeInTheDocument();
  });
});

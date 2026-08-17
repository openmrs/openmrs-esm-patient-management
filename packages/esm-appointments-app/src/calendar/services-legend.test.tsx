import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ServicesLegend from './services-legend.component';

describe('ServicesLegend', () => {
  it('shows nothing when there are no services', () => {
    render(<ServicesLegend services={[]} />);
    expect(screen.getByTestId('services-legend')).toBeEmptyDOMElement();
    expect(screen.queryByText('Services')).not.toBeInTheDocument();
  });

  it('shows the section title and one row per service, each with the correct service name', () => {
    const services = [
      { uuid: 'service-1', name: 'General Medicine' },
      { uuid: 'service-2', name: 'Cardiology' },
    ];
    render(<ServicesLegend services={services} />);

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('General Medicine')).toBeInTheDocument();
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  it("shows each service row with a color swatch in that service's color", () => {
    const services = [
      { uuid: 'service-1', name: 'General Medicine' },
      { uuid: 'service-2', name: 'Cardiology' },
    ];
    const serviceColorMap = new Map([
      ['service-1', '#73A947'],
      ['service-2', '#1990DC'],
    ]);

    render(<ServicesLegend services={services} serviceColorMap={serviceColorMap} />);

    expect(screen.getByTestId('legend-swatch-service-1')).toHaveStyle({ backgroundColor: '#73A947' });
    expect(screen.getByTestId('legend-swatch-service-2')).toHaveStyle({ backgroundColor: '#1990DC' });
  });

  it('does not crash and shows a blank swatch when a service has no color assigned', () => {
    const services = [{ uuid: 'service-no-color', name: 'Unassigned Service' }];

    render(<ServicesLegend services={services} />);
    expect(screen.getByText('Unassigned Service')).toBeInTheDocument();
    expect(screen.getByTestId('legend-swatch-service-no-color')).toBeInTheDocument();
  });
});

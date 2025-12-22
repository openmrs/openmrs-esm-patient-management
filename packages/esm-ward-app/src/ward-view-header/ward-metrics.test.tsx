import { useAppContext } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithSwr } from 'tools';
import { mockWardViewContext } from '../../mock';
import { WardMetricType, type WardViewContext } from '../types';
import WardMetrics from './ward-metrics.component';

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

describe('Ward Metrics', () => {
  it('Should display standard metrics by default', () => {
    renderWithSwr(<WardMetrics />);
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Free beds')).toBeInTheDocument();
    expect(screen.getByText('Total beds')).toBeInTheDocument();
    expect(screen.getByText('Pending out')).toBeInTheDocument();
    expect(screen.queryByText('Mothers')).not.toBeInTheDocument();
    expect(screen.queryByText('Infants')).not.toBeInTheDocument();
  });
  it('Should display extra metrics when configured', () => {
    renderWithSwr(<WardMetrics metrics={[WardMetricType.FEMALES_OF_REPRODUCTIVE_AGE]} />);
    expect(screen.getByText('Mothers')).toBeInTheDocument();
    expect(screen.queryByText('Patients')).not.toBeInTheDocument();
    expect(screen.queryByText('Free beds')).not.toBeInTheDocument();
    expect(screen.queryByText('Total beds')).not.toBeInTheDocument();
    expect(screen.queryByText('Pending out')).not.toBeInTheDocument();
  });
});

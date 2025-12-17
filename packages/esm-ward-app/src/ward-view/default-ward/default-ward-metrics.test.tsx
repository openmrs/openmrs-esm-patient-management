import { useAppContext } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithSwr } from 'tools';
import { mockWardViewContext } from '../../../mock';
import { type WardViewContext } from '../../types';
import { getWardMetrics } from '../ward-view.resource';
import DefaultWardMetrics from './default-ward-metrics.component';

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

describe('Ward Metrics', () => {
  it('Should display metrics of in the ward ', () => {
    const mockWardPatientGroupDetails = mockWardViewContext.wardPatientGroupDetails;
    renderWithSwr(<DefaultWardMetrics />);
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Free beds')).toBeInTheDocument();
    expect(screen.getByText('Total beds')).toBeInTheDocument();
  });
});

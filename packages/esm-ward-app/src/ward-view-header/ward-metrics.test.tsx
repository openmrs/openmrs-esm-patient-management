import React from 'react';
import WardMetrics from './ward-metrics.component';
import { renderWithSwr } from '../../../../tools/test-utils';
import { useParams } from 'react-router-dom';
import { useBeds } from '../hooks/useBeds';
import { mockWardBeds } from '../../../../__mocks__/wardBeds.mock';
import { getWardMetrics } from '../ward-view/ward-view.resource';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock('../hooks/useBeds', () => ({
  useBeds: jest.fn(),
}));
jest.mocked(useBeds).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  beds: mockWardBeds,
});

describe('Ward Metrics', () => {
  it('Should display metrics of in the ward ', () => {
    const bedMetrics = getWardMetrics(mockWardBeds);
    const { getByText } = renderWithSwr(<WardMetrics />);
    for (let [key, value] of Object.entries(bedMetrics)) {
      expect(getByText(value)).toBeInTheDocument();
    }
  });
});

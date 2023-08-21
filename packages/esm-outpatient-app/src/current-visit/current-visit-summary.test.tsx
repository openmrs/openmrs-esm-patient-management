import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CurrentVisit from './current-visit-summary.component';
import { useVisit } from './current-visit.resource';
import { mockPastVisit } from '../../__mocks__/visits.mock';

const useVisitMock = useVisit as jest.Mock;

jest.mock('./current-visit.resource', () => ({
  useVisit: jest.fn(() => ({
    visit: {
      visitType: { display: 'Visit Type' },
      encounters: [],
    },
    isError: false,
    isLoading: false,
  })),
}));

const patientUuid = mockPastVisit.data.results[0].patient.uuid;
const visitUuid = mockPastVisit.data.results[0].uuid;

describe('CurrentVisit', () => {
  it('renders visit details correctly', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
      expect(screen.getByText('Visit Type')).toBeInTheDocument();
      expect(screen.getByText('Scheduled for today')).toBeInTheDocument();
      expect(screen.getByText('On time')).toBeInTheDocument();
    });
  });
  it('should render skeleton when loading', async () => {
    useVisitMock.mockImplementationOnce(() => ({
      visit: undefined,
      isError: false,
      isLoading: true,
    }));

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});

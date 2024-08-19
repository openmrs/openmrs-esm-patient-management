import React from 'react';
import { render, screen } from '@testing-library/react';
import { mockPastVisit } from '__mocks__';
import { useVisit } from './current-visit.resource';
import CurrentVisit from './current-visit-summary.component';

const useVisitMock = jest.mocked(useVisit);

jest.mock('./current-visit.resource', () => ({
  useVisit: jest.fn().mockReturnValue({
    visit: {
      visitType: { display: 'Visit Type' },
      encounters: [],
    },
    error: null,
    isLoading: false,
  }),
}));

const patientUuid = mockPastVisit.data.results[0].patient.uuid;
const visitUuid = mockPastVisit.data.results[0].uuid;

describe('CurrentVisit', () => {
  it('renders visit details correctly', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Visit Type')).toBeInTheDocument();
    expect(screen.getByText('Scheduled for today')).toBeInTheDocument();
    expect(screen.getByText('On time')).toBeInTheDocument();
  });
  it('renders a loading skeleton when fetching data', async () => {
    useVisitMock.mockReturnValue({
      visit: null,
      error: null,
      isLoading: true,
      isValidating: false,
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

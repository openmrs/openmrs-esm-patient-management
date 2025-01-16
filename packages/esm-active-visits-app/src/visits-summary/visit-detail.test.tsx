import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useVisit } from './visit.resource';
import VisitDetailComponent from './visit-detail.component';

const mockUseVisit = jest.mocked(useVisit);
const defaultProps = {
  patientUuid: '691eed12-c0f1-11e2-94be-8c13b969e334',
  visitUuid: '497b8b17-54ec-4726-87ec-3c4da8cdcaeb',
};

jest.mock('./visit.resource', () => ({
  ...jest.requireActual('./visit.resource'),
  useVisit: jest.fn(),
}));

describe('VisitDetail', () => {
  it('renders a loading spinner when data is loading', () => {
    mockUseVisit.mockReturnValue({
      visit: null,
      error: undefined,
      isLoading: true,
      isValidating: false,
    });

    render(<VisitDetailComponent {...defaultProps} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a visit detail overview when data is available', () => {
    const mockVisitDate = new Date();

    mockUseVisit.mockReturnValue({
      visit: {
        encounters: [],
        startDatetime: mockVisitDate.toISOString(),
        uuid: defaultProps.visitUuid,
        visitType: { display: 'Some Visit Type', uuid: 'some-visit-type-uuid' },
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
    });

    render(<VisitDetailComponent {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /some visit type/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /no encounters found/i })).toBeInTheDocument();
    expect(screen.getByText(/there is no information to display here/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /all encounters/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /visit summary/i })).toBeInTheDocument();
  });

  it('renders the Encounter Lists view when the "All Encounters" tab is clicked', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({
      visit: {
        encounters: [
          {
            uuid: 'encounter-1',
            encounterDateTime: '2023-07-30T12:34:56Z',
            encounterType: { display: 'Encounter Type' },
            encounterProviders: [],
            obs: [],
          },
        ],
        startDatetime: '2023-07-30T12:34:56Z',
        visitType: { display: 'Some Visit Type', uuid: 'some-visit-type-uuid' },
        uuid: defaultProps.visitUuid,
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
    });

    render(<VisitDetailComponent {...defaultProps} />);

    await user.click(screen.getByRole('tab', { name: /all encounters/i }));
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /time/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /encounter type/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /provider/i })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /12:34 pm encounter type/i })).toBeInTheDocument();
  });

  it('renders the Visit Summaries view when the "Visit Summary" tab is clicked', async () => {
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({
      visit: {
        encounters: [
          {
            uuid: 'encounter-1',
            encounterDateTime: '2023-07-30T12:34:56Z',
            encounterType: { display: 'Encounter Type 1' },
            encounterProviders: [],
            obs: [],
            orders: [],
          },
          {
            uuid: 'encounter-2',
            encounterDateTime: '2023-07-30T13:45:00Z',
            encounterType: { display: 'Encounter Type 2' },
            encounterProviders: [],
            obs: [],
            orders: [],
          },
        ],
        startDatetime: '2023-07-30T12:34:56Z',
        visitType: { display: 'Some Visit Type', uuid: 'some-visit-type-uuid' },
        uuid: defaultProps.visitUuid,
      },
      error: undefined,
      isLoading: false,
      isValidating: false,
    });

    render(<VisitDetailComponent {...defaultProps} />);

    await user.click(screen.getByRole('tab', { name: /visit summary/i }));
    expect(screen.getByRole('tablist', { name: /visit summary tabs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tests/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByText(/no diagnoses found/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no notes to display for this patient/i)).toBeInTheDocument();
  });
});

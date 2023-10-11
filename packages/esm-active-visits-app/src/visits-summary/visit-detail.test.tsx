import React from 'react';
import { render, screen, act } from '@testing-library/react';
import VisitDetailComponent from './visit-detail.component';
import { useVisit } from './visit.resource';
import { formatDate } from '@openmrs/esm-framework';

jest.mock('./visit.resource');

const mockedUseVisit = useVisit as jest.Mock;

describe('VisitDetailComponent', () => {
  const visitUuid = '497b8b17-54ec-4726-87ec-3c4da8cdcaeb';
  const patientUuid = '691eed12-c0f1-11e2-94be-8c13b969e334';

  it('renders loading indicator when data is loading', () => {
    mockedUseVisit.mockReturnValueOnce({
      visit: null,
      isLoading: true,
    });

    render(<VisitDetailComponent visitUuid={visitUuid} patientUuid={patientUuid} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render visit details and switches when data is available', () => {
    let visitDate = new Date();
    mockedUseVisit.mockReturnValueOnce({
      visit: {
        uuid: visitUuid,
        visitType: { display: 'Some Visit Type' },
        startDatetime: visitDate,
        encounters: [],
      },
      isLoading: false,
    });

    render(<VisitDetailComponent visitUuid={visitUuid} patientUuid={patientUuid} />);

    expect(screen.getByText(/Some Visit Type/)).toBeInTheDocument();
    expect(screen.getByText(formatDate(visitDate))).toBeInTheDocument();

    expect(screen.getByText('All Encounters')).toBeInTheDocument();
    expect(screen.getByText('Visit Summary')).toBeInTheDocument();
  });

  it('should render EncounterLists when "All Encounters" switch is selected', () => {
    mockedUseVisit.mockReturnValue({
      visit: {
        uuid: visitUuid,
        visitType: { display: 'Some Visit Type' },
        startDatetime: '2023-07-30T12:34:56Z',
        encounters: [
          {
            uuid: 'encounter-1',
            encounterDateTime: '2023-07-30T12:34:56Z',
            encounterType: { display: 'Encounter Type' },
            encounterProviders: [],
            obs: [],
          },
        ],
      },
      isLoading: false,
    });

    render(<VisitDetailComponent visitUuid={visitUuid} patientUuid={patientUuid} />);

    act(() => {
      screen.getByText('All Encounters').click();
    });

    expect(screen.getByTestId('encountersTable')).toBeInTheDocument();
  });

  it('should render VisitSummaries when "Visit Summary" switch is selected', () => {
    mockedUseVisit.mockReturnValue({
      visit: {
        uuid: visitUuid,
        visitType: { display: 'Some Visit Type' },
        startDatetime: '2023-07-30T12:34:56Z',
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
      },
      isLoading: false,
    });

    render(<VisitDetailComponent visitUuid={visitUuid} patientUuid={patientUuid} />);

    act(() => {
      screen.getByText('Visit Summary').click();
    });

    expect(screen.getByRole('tablist', { name: 'Visit summary tabs' })).toBeInTheDocument();
  });

  it('should render loading indicator when data is loading', () => {
    mockedUseVisit.mockReturnValue({
      visit: null,
      isLoading: false,
    });

    render(<VisitDetailComponent visitUuid={visitUuid} patientUuid={patientUuid} />);

    expect(screen.queryByRole('button', { name: 'All Encounters' })).toBeNull();
  });
});

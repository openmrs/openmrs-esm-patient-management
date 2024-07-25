import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { formatDate } from '@openmrs/esm-framework';
import { useVisit } from './visit.resource';
import VisitDetailComponent from './visit-detail.component';

const defaultProps = {
  patientUuid: '691eed12-c0f1-11e2-94be-8c13b969e334',
  visitUuid: '497b8b17-54ec-4726-87ec-3c4da8cdcaeb',
};
const mockUseVisit = jest.mocked(useVisit);

jest.mock('./visit.resource');

describe('VisitDetail', () => {
  it('renders a loading spinner when data is loading', () => {
    mockUseVisit.mockReturnValueOnce({
      visit: null,
      error: undefined,
      isLoading: true,
      isValidating: false,
    });

    renderVisitDetail();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a visit detail overview when data is available', () => {
    const mockVisitDate = new Date();
    mockUseVisit.mockReturnValueOnce({
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

    renderVisitDetail();

    expect(screen.getByText(/Some Visit Type/)).toBeInTheDocument();
    expect(screen.getByText(formatDate(mockVisitDate), { collapseWhitespace: false })).toBeInTheDocument();
    expect(screen.getByText('All Encounters')).toBeInTheDocument();
    expect(screen.getByText('Visit Summary')).toBeInTheDocument();
  });

  it('render the Encounter Lists view when the "All Encounters" tab is clicked', async () => {
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

    renderVisitDetail();

    await user.click(screen.getByText('All Encounters'));
    expect(screen.getByTestId('encountersTable')).toBeInTheDocument();
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

    renderVisitDetail();

    await user.click(screen.getByText('Visit Summary'));
    expect(screen.getByRole('tablist', { name: 'Visit summary tabs' })).toBeInTheDocument();
  });
});

function renderVisitDetail() {
  render(<VisitDetailComponent {...defaultProps} />);
}

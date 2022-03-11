import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch } from '@openmrs/esm-framework';
import { swrRender, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockServices, mockVisitQueueEntries } from '../../__mocks__/active-visits.mock';
import ActiveVisitsTable from './active-visits-table.component';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('./active-visits-table.resource.ts', () => {
  const originalModule = jest.requireActual('./active-visits-table.resource.ts');

  return {
    ...originalModule,
    useServiceMetadata: jest.fn().mockReturnValue({ services: mockServices }),
  };
});

describe('ActiveVisitsTable: ', () => {
  it('renders an empty state view if data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderActiveVisitsTable();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText(/active visits/i)).toBeInTheDocument();
    expect(screen.getByText(/no patients to display/i)).toBeInTheDocument();
  });

  it('renders a tabular overview of visit queue entry data when available', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: { results: mockVisitQueueEntries } });

    renderActiveVisitsTable();

    await waitForLoadingToFinish();

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText(/active visits/i)).toBeInTheDocument();
    expect(screen.queryByText(/no patients to display/i)).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    const defaultViewButton = screen.getByRole('tab', { name: /default/i });
    const largeViewButton = screen.getByRole('tab', { name: /large/i });

    expect(defaultViewButton).toBeInTheDocument();
    expect(largeViewButton).toBeInTheDocument();
    expect(defaultViewButton).toHaveAttribute('aria-selected', 'true');

    userEvent.click(largeViewButton);
    expect(largeViewButton).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByRole('link', { name: /eric test ric/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /john smith/i })).toBeInTheDocument();
    expect(screen.getByRole('tooltip', { name: /needs triage/i })).toBeInTheDocument();
    expect(screen.getByRole('tooltip', { name: /needs immediate assistance/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/name/, /priority/, /status/, /wait time \(mins\)/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /Eric Test Ric Not Urgent Needs Triage Waiting/,
      /John Smith Emergency Needs immediate assistance Waiting/,
    ];

    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });

    // filter table to only show patients waiting for `Triage`
    const serviceFilter = screen.getByRole('button', { name: /show patients waiting for/i });
    userEvent.click(serviceFilter);
    userEvent.click(screen.getByRole('option', { name: /Triage/i }));

    expect(screen.queryByText(/waiting for clinical consultation/i)).not.toBeInTheDocument();
    expect(screen.getByText(/waiting for triage/i)).toBeInTheDocument();

    // show patients waiting for all services
    userEvent.click(serviceFilter);
    userEvent.click(screen.getByRole('option', { name: /all/i }));

    expect(screen.getByText(/waiting for triage/i)).toBeInTheDocument();
    expect(screen.getByText(/waiting for clinical consultation/i)).toBeInTheDocument();

    // filter table by typing in the searchbox
    const searchbox = screen.getByRole('searchbox');
    userEvent.type(searchbox, 'Eric');

    expect(screen.getByText(/eric test ric/i)).toBeInTheDocument();
    expect(screen.queryByText(/john smith/i)).not.toBeInTheDocument();
  });
});

function renderActiveVisitsTable() {
  swrRender(<ActiveVisitsTable />);
}

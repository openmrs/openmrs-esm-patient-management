import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// BedAdministrationTable and summaryResource are imported after mocks to ensure mocks are applied

jest.mock('../summary/summary.resource', () => ({
  useBedsGroupedByLocation: jest.fn(),
}));

// Mock ResizeObserver used by floating-ui (Carbon components)
// @ts-ignore
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

jest.mock('@openmrs/esm-framework', () => ({
  usePagination: (data: any) => ({ results: data ?? [], currentPage: 1, goTo: jest.fn() }),
  useLayoutType: jest.fn(() => 'desktop'),
  ErrorState: ({ error, headerTitle }: any) => React.createElement('div', null, headerTitle, error?.message ?? ''),
  isDesktop: (_layout: any) => true,
  launchWorkspace2: jest.fn(),
  useSession: jest.fn(() => ({})),
  PageHeader: ({ children }: any) => React.createElement('div', null, children),
  PageHeaderContent: ({ title, illustration }: any) => React.createElement('div', null, illustration, title),
  ConfigurableLink: ({ children }: any) => React.createElement('a', null, children),
  formatDate: (_d: any) => '2026-08-11',
  InPatientPictogram: () => React.createElement('span', null, 'pictogram'),
}));

import BedAdministrationTable from './bed-administration-table.component';
import * as summaryResource from '../summary/summary.resource';

describe('BedAdministrationTable', () => {
  afterEach(() => jest.resetAllMocks());

  it('shows blocking ErrorState when initial load errors', async () => {
    (summaryResource as any).useBedsGroupedByLocation.mockReturnValue({
      bedsGroupedByLocation: [],
      errorFetchingBedsGroupedByLocation: new Error('boom'),
      isLoadingBedsGroupedByLocation: false,
      isValidatingBedsGroupedByLocation: false,
      mutateBedsGroupedByLocation: jest.fn(),
    });

    render(<BedAdministrationTable />);

    // Table should not be rendered when there's an error and no rows
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Bed allocation')).toBeInTheDocument();
  });

  it('preserves rows on background revalidation failure and shows non-blocking notification', async () => {
    const initialBeds = [
      [
        {
          uuid: '1',
          bedNumber: 'B-1',
          location: { display: 'Loc A', uuid: 'loc-a' },
          status: 'AVAILABLE',
        },
      ],
    ];

    // initial successful load
    (summaryResource as any).useBedsGroupedByLocation.mockReturnValue({
      bedsGroupedByLocation: initialBeds,
      errorFetchingBedsGroupedByLocation: null,
      isLoadingBedsGroupedByLocation: false,
      isValidatingBedsGroupedByLocation: false,
      mutateBedsGroupedByLocation: jest.fn(),
    });

    const { rerender } = render(<BedAdministrationTable />);

    // table should be present and show the bed number
    expect(await screen.findByText('B-1')).toBeInTheDocument();

    // simulate background revalidation failure while keeping previous data
    (summaryResource as any).useBedsGroupedByLocation.mockReturnValue({
      bedsGroupedByLocation: initialBeds,
      errorFetchingBedsGroupedByLocation: new Error('background-fail'),
      isLoadingBedsGroupedByLocation: false,
      isValidatingBedsGroupedByLocation: true,
      mutateBedsGroupedByLocation: jest.fn(),
    });

    rerender(<BedAdministrationTable />);

    // previously loaded row should still be visible
    expect(await screen.findByText('B-1')).toBeInTheDocument();

    // non-blocking background notification should be shown
    expect(await screen.findByText('Background fetch failed')).toBeInTheDocument();
  });

  it('clears error and updates rows after successful revalidation', async () => {
    const initialBeds = [
      [
        {
          uuid: '1',
          bedNumber: 'B-1',
          location: { display: 'Loc A', uuid: 'loc-a' },
          status: 'AVAILABLE',
        },
      ],
    ];

    const updatedBeds = [
      [
        {
          uuid: '2',
          bedNumber: 'B-2',
          location: { display: 'Loc A', uuid: 'loc-a' },
          status: 'OCCUPIED',
        },
      ],
    ];

    // start with background error state (previous data present)
    (summaryResource as any).useBedsGroupedByLocation.mockReturnValue({
      bedsGroupedByLocation: initialBeds,
      errorFetchingBedsGroupedByLocation: new Error('background-fail'),
      isLoadingBedsGroupedByLocation: false,
      isValidatingBedsGroupedByLocation: true,
      mutateBedsGroupedByLocation: jest.fn(),
    });

    const { rerender } = render(<BedAdministrationTable />);

    expect(await screen.findByText('B-1')).toBeInTheDocument();
    expect(await screen.findByText('Background fetch failed')).toBeInTheDocument();

    // simulate successful revalidation with updated data
    (summaryResource as any).useBedsGroupedByLocation.mockReturnValue({
      bedsGroupedByLocation: updatedBeds,
      errorFetchingBedsGroupedByLocation: null,
      isLoadingBedsGroupedByLocation: false,
      isValidatingBedsGroupedByLocation: false,
      mutateBedsGroupedByLocation: jest.fn(),
    });

    rerender(<BedAdministrationTable />);

    // background notification should be gone and new row present
    await waitFor(() => expect(screen.queryByText('Background fetch failed')).not.toBeInTheDocument());
    expect(await screen.findByText('B-2')).toBeInTheDocument();
  });
});

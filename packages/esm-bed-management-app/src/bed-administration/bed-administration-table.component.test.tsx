import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, expect, afterEach } from 'vitest';
import * as esmFramework from '@openmrs/esm-framework';
// BedAdministrationTable and summaryResource are imported after mocks to ensure mocks are applied

(globalThis as any).getOpenmrsSpaBase = vi.fn(() => '/openmrs/spa/');

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}));

vi.mock('../summary/summary.resource', () => ({
  useBedsGroupedByLocation: vi.fn(),
}));

// Mock ResizeObserver used by floating-ui (Carbon components)
// @ts-ignore
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('@openmrs/esm-framework', () => ({
  usePagination: (data: any) => ({ results: data ?? [], currentPage: 1, goTo: vi.fn() }),
  useLayoutType: vi.fn(() => 'desktop'),
  ErrorState: ({ error, headerTitle }: any) => React.createElement('div', null, headerTitle, error?.message ?? ''),
  isDesktop: (_layout: any) => true,
  launchWorkspace2: vi.fn(),
  showSnackbar: vi.fn(),
  useSession: vi.fn(() => ({})),
  PageHeader: ({ children }: any) => React.createElement('div', null, children),
  PageHeaderContent: ({ title, illustration }: any) => React.createElement('div', null, illustration, title),
  ConfigurableLink: ({ children }: any) => React.createElement('a', null, children),
  formatDate: (_d: any) => '2026-08-11',
  InPatientPictogram: () => React.createElement('span', null, 'pictogram'),
}));

import BedAdministrationTable from './bed-administration-table.component';
import * as summaryResource from '../summary/summary.resource';

const mockShowSnackbar = vi.mocked(esmFramework.showSnackbar);

describe('BedAdministrationTable', () => {
  afterEach(() => vi.clearAllMocks());

  it('shows blocking ErrorState when initial load errors', async () => {
    (summaryResource as any).useBedsGroupedByLocation.mockReturnValue({
      bedsGroupedByLocation: [],
      errorFetchingBedsGroupedByLocation: new Error('boom'),
      isLoadingBedsGroupedByLocation: false,
      isValidatingBedsGroupedByLocation: false,
      mutateBedsGroupedByLocation: vi.fn(),
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
      mutateBedsGroupedByLocation: vi.fn(),
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
      mutateBedsGroupedByLocation: vi.fn(),
    });

    rerender(<BedAdministrationTable />);

    // previously loaded row should still be visible
    expect(await screen.findByText('B-1')).toBeInTheDocument();

    // non-blocking background warning should be shown via snackbar
    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        kind: 'warning',
        isLowContrast: true,
        title: 'Background fetch failed',
      }),
    );
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
      mutateBedsGroupedByLocation: vi.fn(),
    });

    const { unmount } = render(<BedAdministrationTable />);

    const bedNumberCells = await screen.findAllByText('B-1');
    expect(bedNumberCells.length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        kind: 'warning',
        isLowContrast: true,
        title: 'Background fetch failed',
      }),
    );

    // simulate successful revalidation with updated data
    unmount();
    (summaryResource as any).useBedsGroupedByLocation.mockReturnValue({
      bedsGroupedByLocation: updatedBeds,
      errorFetchingBedsGroupedByLocation: null,
      isLoadingBedsGroupedByLocation: false,
      isValidatingBedsGroupedByLocation: false,
      mutateBedsGroupedByLocation: vi.fn(),
    });

    const { container } = render(<BedAdministrationTable />);
    const local = within(container);

    // background warning should clear after successful revalidation and new row present
    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalledTimes(1));
    expect(await local.findByText('B-2')).toBeInTheDocument();
  });
});

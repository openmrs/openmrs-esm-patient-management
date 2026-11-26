import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ExtensionSlot,
  getDefaultsFromConfigSchema,
  launchWorkspace2,
  useConfig,
  useLayoutType,
  useVisit,
} from '@openmrs/esm-framework';
import { mockAdvancedSearchResults } from '__mocks__';
import { configSchema } from './config-schema';
import { type SearchedPatient } from './types';
import PatientBanner from './patient-search-page/patient-banner/banner/patient-banner.component';
import StartVisitButton2 from './patient-search-page/patient-banner/banner/start-visit-button2.component';
import PatientSearchPage from './patient-search-page/patient-search-page.component';
import PatientSearchOverlay from './patient-search-overlay/patient-search-overlay.component';
import PatientSearchWorkspace2 from './patient-search-workspace/patient-search2.workspace';

const patient = mockAdvancedSearchResults[0] as unknown as SearchedPatient;

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) as object),
  useSearchParams: () => [new URLSearchParams({ query: 'Joseph' })],
}));

// Keep the result card and visit action real while avoiding search requests and filter controls.
vi.mock('./patient-search-page/advanced-patient-search.component', () => ({
  default: () => <PatientBanner patient={patient} patientUuid={patient.uuid} />,
}));

beforeEach(() => {
  vi.mocked(useConfig).mockReturnValue(getDefaultsFromConfigSchema(configSchema));
  vi.mocked(useVisit).mockReturnValue({
    activeVisit: null,
    currentVisit: null,
    currentVisitIsRetrospective: false,
    mutate: vi.fn(),
    error: undefined,
    isLoading: false,
    isValidating: false,
  });
  vi.mocked(ExtensionSlot).mockImplementation(({ name, state }) =>
    name === 'start-visit-button-slot2' ? (
      <StartVisitButton2 {...(state as React.ComponentProps<typeof StartVisitButton2>)} />
    ) : null,
  );
});

describe('standalone patient search', () => {
  it.each(['desktop', 'tablet'] as const)(
    'offers chart navigation without Start visit on the %s search page',
    (layout) => {
      vi.mocked(useLayoutType).mockReturnValue(layout);
      render(<PatientSearchPage />);

      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Start visit' })).not.toBeInTheDocument();
      expect(launchWorkspace2).not.toHaveBeenCalled();
    },
  );

  it('closes the tablet overlay when a patient is selected without launching a workspace group', async () => {
    const user = userEvent.setup();
    vi.mocked(useLayoutType).mockReturnValue('tablet');
    const closeSearch = vi.fn();
    render(<PatientSearchOverlay query="Joseph" onClose={closeSearch} patientClickSideEffect={closeSearch} />);

    expect(screen.queryByRole('button', { name: 'Start visit' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link'));

    expect(closeSearch).toHaveBeenCalledWith(patient.uuid, expect.objectContaining({ id: patient.uuid }));
    expect(launchWorkspace2).not.toHaveBeenCalled();
  });
});

describe('embedded patient search', () => {
  it.each(['desktop', 'tablet'] as const)(
    'starts a visit in the host workspace on %s and preserves its callback',
    async (layout) => {
      const user = userEvent.setup();
      vi.mocked(useLayoutType).mockReturnValue(layout);
      const launchChildWorkspace = vi.fn().mockResolvedValue(undefined);
      const closeWorkspace = vi.fn().mockResolvedValue(true);
      const onVisitStarted = vi.fn();
      render(
        <PatientSearchWorkspace2
          workspaceProps={{
            initialQuery: 'Joseph',
            workspaceTitle: 'Add patient to queue',
            onPatientSelected: vi.fn(),
            onVisitStarted,
          }}
          windowProps={{ startVisitWorkspaceName: 'queue-start-visit' }}
          groupProps={null}
          workspaceName="queue-search"
          windowName="queue-search-window"
          isRootWorkspace
          showActionMenu
          launchChildWorkspace={launchChildWorkspace}
          closeWorkspace={closeWorkspace}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Start visit' }));

      expect(launchChildWorkspace).toHaveBeenCalledWith('queue-start-visit', {
        openedFrom: 'patient-search-results',
        patient: expect.objectContaining({ id: patient.uuid }),
        patientUuid: patient.uuid,
        onVisitStarted: expect.any(Function),
      });
      const visit = { uuid: 'new-visit' };
      launchChildWorkspace.mock.lastCall[1].onVisitStarted(visit);
      expect(onVisitStarted).toHaveBeenCalledWith(
        patient.uuid,
        expect.objectContaining({ id: patient.uuid }),
        visit,
        launchChildWorkspace,
        closeWorkspace,
      );
      expect(launchWorkspace2).not.toHaveBeenCalled();
    },
  );
});

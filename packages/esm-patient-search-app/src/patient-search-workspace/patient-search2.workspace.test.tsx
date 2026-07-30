import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import PatientSearchWorkspace2 from './patient-search2.workspace';

const mockUseConfig = vi.mocked(useConfig<PatientSearchConfig>);

vi.mock('../patient-search-bar/patient-search-bar.component', () => ({
  default: ({ onChange }: { onChange: (value: string) => void }) => (
    <input aria-label="Search for a patient" onChange={(event) => onChange(event.target.value)} />
  ),
}));

vi.mock('../patient-search-page/advanced-patient-search.component', () => ({
  default: ({ query }: { query: string }) => <div>Search results for {query}</div>,
}));

function renderWorkspace(preSearchContent?: () => React.ReactNode) {
  const onPatientSelected = vi.fn();
  const launchChildWorkspace = vi.fn();
  const closeWorkspace = vi.fn();
  render(
    <PatientSearchWorkspace2
      {...({
        workspaceProps: { workspaceTitle: 'Add patient to queue', onPatientSelected, preSearchContent },
        windowProps: { startVisitWorkspaceName: 'start-visit' },
        launchChildWorkspace,
        closeWorkspace,
      } as unknown as React.ComponentProps<typeof PatientSearchWorkspace2>)}
    />,
  );
  return { onPatientSelected, launchChildWorkspace, closeWorkspace };
}

describe('PatientSearchWorkspace2', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
  });

  it('renders preSearchContent (and not search results) before a query is entered', () => {
    const preSearchContent = vi.fn(() => <div>Checked in patients list</div>);
    const { onPatientSelected, launchChildWorkspace, closeWorkspace } = renderWorkspace(preSearchContent);

    expect(screen.getByText('Checked in patients list')).toBeInTheDocument();
    expect(screen.queryByText(/search results for/i)).not.toBeInTheDocument();
    expect(preSearchContent).toHaveBeenCalledWith({ onPatientSelected, launchChildWorkspace, closeWorkspace });
  });

  it('replaces preSearchContent with search results once a query is entered', async () => {
    const user = userEvent.setup();
    const preSearchContent = vi.fn(() => <div>Checked in patients list</div>);
    renderWorkspace(preSearchContent);

    await user.type(screen.getByLabelText('Search for a patient'), 'Jo');

    expect(await screen.findByText('Search results for Jo')).toBeInTheDocument();
    expect(screen.queryByText('Checked in patients list')).not.toBeInTheDocument();
  });

  it('renders neither shortlist nor results when no preSearchContent is provided and no query is entered', () => {
    renderWorkspace(undefined);
    expect(screen.queryByText(/search results for/i)).not.toBeInTheDocument();
  });
});

import React from 'react';
import { vi, describe, it, expect, beforeEach, type MockInstance } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockQueueEntryAlice, mockQueueEntryBrian, mockStatusWaiting } from '__mocks__';
import {
  configSchema,
  type ActionsColumnConfig,
  type ConfigObject,
  type ConfigurableQueueEntryAction,
} from '../../config-schema';
import { type QueueEntry } from '../../types';
import { queueTableActionColumn } from './queue-table-action-cell.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const configDefaults = getDefaultsFromConfigSchema<ConfigObject>(configSchema);

vi.mock('../../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: vi.fn() }),
}));

// Alice is "In Service" and Brian is "Waiting", so the `call` action is hidden for Alice and the cell
// falls back to promoting the first visible overflow menu action to an inline button.
function renderActionCell(
  actions: { buttons: ConfigurableQueueEntryAction[]; overflowMenu: ConfigurableQueueEntryAction[] },
  queueEntry: QueueEntry = mockQueueEntryAlice,
) {
  const { CellComponent } = queueTableActionColumn('actions', 'Actions', { actions } as ActionsColumnConfig);
  render(<CellComponent queueEntry={queueEntry} />);
}

async function openOverflowMenu() {
  await userEvent.click(screen.getByRole('button', { name: 'Options' }));
  // Carbon leaves the opened menu `visibility: hidden` under jsdom because it cannot position it,
  // which also makes accessible names unavailable, so read the items' labels directly.
  return screen.queryAllByRole('menuitem', { hidden: true }).map((item) => item.getAttribute('aria-label'));
}

describe('queueTableActionColumn', () => {
  let warnSpy: MockInstance;

  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      concepts: { ...configDefaults.concepts, waitingStatusConceptUuid: mockStatusWaiting.uuid },
    } as ConfigObject);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('treats the deprecated "transition" action as "move"', async () => {
    renderActionCell({ buttons: ['edit'], overflowMenu: ['transition', 'remove'] });

    expect(await openOverflowMenu()).toEqual(['Move', 'Remove patient']);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("deprecated action 'transition'"));
  });

  it('renders a single Move action when a config lists both "move" and "transition"', async () => {
    renderActionCell({ buttons: ['edit'], overflowMenu: ['move', 'transition', 'remove'] });

    expect(await openOverflowMenu()).toEqual(['Move', 'Remove patient']);
  });

  it('does not repeat a button action in the overflow menu when the deprecated "transition" resolves to it', async () => {
    renderActionCell({ buttons: ['move'], overflowMenu: ['transition', 'remove'] });

    expect(screen.getByRole('button', { name: 'Move' })).toBeInTheDocument();
    expect(await openOverflowMenu()).toEqual(['Remove patient']);
  });

  it('promotes a deprecated "transition" to the fallback button', async () => {
    renderActionCell({ buttons: ['call'], overflowMenu: ['transition', 'edit'] });

    expect(screen.getByRole('button', { name: 'Move' })).toBeInTheDocument();
    expect(await openOverflowMenu()).toEqual(['Edit']);
  });

  it('skips an unknown action instead of throwing when it heads the overflow menu', () => {
    renderActionCell({ buttons: ['call'], overflowMenu: ['bogus' as ConfigurableQueueEntryAction, 'edit'] });

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  // Only the mocked waitingStatusConceptUuid matches Brian's status, so this pins `call` to the waiting
  // status rather than defaultStatusConceptUuid, which it used to compare against.
  it('shows the Call action for an entry in the waiting status', () => {
    renderActionCell({ buttons: ['call'], overflowMenu: [] }, mockQueueEntryBrian);

    expect(screen.getByRole('button', { name: 'Call' })).toBeInTheDocument();
  });
});

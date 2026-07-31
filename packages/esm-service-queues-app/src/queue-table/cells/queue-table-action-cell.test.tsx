import React from 'react';
import { vi, describe, it, expect, beforeEach, type MockInstance } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, showModal, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { mockQueueEntryAlice, mockStatusWaiting } from '__mocks__';
import {
  configSchema,
  type ActionsColumnConfig,
  type ConfigObject,
  type ConfigurableQueueEntryAction,
} from '../../config-schema';
import { type QueueEntry } from '../../types';
import { serveQueueEntry } from '../../service-queues.resource';
import { queueTableActionColumn } from './queue-table-action-cell.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockShowModal = vi.mocked(showModal);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockServeQueueEntry = vi.mocked(serveQueueEntry);
const configDefaults = getDefaultsFromConfigSchema<ConfigObject>(configSchema);

// The UUID of the visit attribute type carrying Alice's ticket number, see `mockQueueEntryAlice`.
const visitQueueNumberAttributeUuid = 'queue-number-visit-attr-type-uuid';

// Alice is "In Service" by default, so the `call` action is hidden for her; this is the same entry
// waiting to be called, which is the only state in which the Call action is offered.
const mockWaitingQueueEntry: QueueEntry = { ...mockQueueEntryAlice, status: mockStatusWaiting };

vi.mock('../../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: vi.fn() }),
}));

vi.mock('../../service-queues.resource', async () => ({
  ...((await vi.importActual('../../service-queues.resource')) as object),
  serveQueueEntry: vi.fn(),
}));

// Alice is "In Service", so the `call` action is hidden for her and the cell falls back to promoting
// the first visible overflow menu action to an inline button.
function renderActionCell(
  actions: {
    buttons: ConfigurableQueueEntryAction[];
    overflowMenu: ConfigurableQueueEntryAction[];
  },
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
      concepts: { ...configDefaults.concepts, defaultStatusConceptUuid: mockStatusWaiting.uuid },
      visitQueueNumberAttributeUuid,
    } as ConfigObject);
    mockServeQueueEntry.mockResolvedValue({ ok: true, status: 200 } as Awaited<ReturnType<typeof serveQueueEntry>>);
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

  describe('the Call action', () => {
    it('opens the call modal once the patient has been called', async () => {
      const user = userEvent.setup();
      renderActionCell({ buttons: ['call'], overflowMenu: [] }, mockWaitingQueueEntry);

      await user.click(screen.getByRole('button', { name: 'Call' }));

      expect(mockServeQueueEntry).toHaveBeenCalledWith(mockWaitingQueueEntry.queue.name, '42', 'calling');
      expect(mockShowModal).toHaveBeenCalledWith('call-queue-entry-modal', expect.objectContaining({ size: 'sm' }));
      expect(mockShowSnackbar).not.toHaveBeenCalled();
    });

    // Without a rejection handler this leaves an unhandled promise rejection behind, which shows up
    // as a full-screen error overlay in development builds and as nothing at all in production.
    it('reports a failed call request in a snackbar instead of rejecting', async () => {
      const user = userEvent.setup();
      mockServeQueueEntry.mockRejectedValue(new Error('Failed to fetch'));
      renderActionCell({ buttons: ['call'], overflowMenu: [] }, mockWaitingQueueEntry);

      await user.click(screen.getByRole('button', { name: 'Call' }));

      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'Error calling patient',
          subtitle: 'Failed to fetch',
        }),
      );
      expect(mockShowModal).not.toHaveBeenCalled();
      // The button is re-enabled, so the user can retry without reloading the page.
      expect(screen.getByRole('button', { name: 'Call' })).toBeEnabled();
    });

    it('reports a server error response in a snackbar instead of opening the call modal', async () => {
      const user = userEvent.setup();
      mockServeQueueEntry.mockResolvedValue({ ok: false, status: 500 } as Awaited<ReturnType<typeof serveQueueEntry>>);
      renderActionCell({ buttons: ['call'], overflowMenu: [] }, mockWaitingQueueEntry);

      await user.click(screen.getByRole('button', { name: 'Call' }));

      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
      expect(mockShowModal).not.toHaveBeenCalled();
    });

    it('does not send an incomplete request when the ticket number is missing', async () => {
      const user = userEvent.setup();
      mockUseConfig.mockReturnValue({
        ...configDefaults,
        concepts: { ...configDefaults.concepts, defaultStatusConceptUuid: mockStatusWaiting.uuid },
        visitQueueNumberAttributeUuid: 'an-attribute-type-this-visit-does-not-have',
      } as ConfigObject);
      renderActionCell({ buttons: ['call'], overflowMenu: [] }, mockWaitingQueueEntry);

      await user.click(screen.getByRole('button', { name: 'Call' }));

      expect(mockServeQueueEntry).not.toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: 'Error calling patient',
          subtitle: expect.stringContaining('ticket number'),
        }),
      );
      expect(mockShowModal).not.toHaveBeenCalled();
    });

    it('reports a failed call request launched from the overflow menu', async () => {
      const user = userEvent.setup();
      mockServeQueueEntry.mockRejectedValue(new Error('Failed to fetch'));
      renderActionCell({ buttons: ['edit'], overflowMenu: ['call'] }, mockWaitingQueueEntry);

      await user.click(screen.getByRole('button', { name: 'Options' }));
      // See `openOverflowMenu` above: Carbon's opened menu has no accessible name under happy-dom.
      const callMenuItem = screen
        .getAllByRole('menuitem', { hidden: true })
        .find((item) => item.getAttribute('aria-label') === 'Call');
      await user.click(callMenuItem);

      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });
  });
});

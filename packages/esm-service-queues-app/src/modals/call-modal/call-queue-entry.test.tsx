import React from 'react';
import { vi, describe, it, expect, beforeEach, type MockInstance } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, navigate, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { mockQueueEntryAlice } from '__mocks__';
import { configSchema, type ConfigObject } from '../../config-schema';
import { serveQueueEntry, updateQueueEntry } from '../../service-queues.resource';
import { requeueQueueEntry } from './call-queue-entry.resource';
import CallQueueEntryModal from './call-queue-entry.modal';

const mockNavigate = vi.mocked(navigate);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

vi.mock('../../service-queues.resource', async () => ({
  ...((await vi.importActual('../../service-queues.resource')) as object),
  serveQueueEntry: vi.fn().mockResolvedValue({ status: 200 }),
  updateQueueEntry: vi.fn().mockResolvedValue({ status: 201 }),
}));

const { mockMutateQueueEntries } = vi.hoisted(() => ({ mockMutateQueueEntries: vi.fn() }));

vi.mock('../../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: mockMutateQueueEntries }),
}));

vi.mock('./call-queue-entry.resource', () => ({
  requeueQueueEntry: vi.fn().mockResolvedValue({ status: 200 }),
}));

describe('MoveQueueEntryModal', () => {
  let errorSpy: MockInstance;

  beforeEach(() => {
    // `clearMocks` clears calls but keeps implementations, so restore the happy path each time.
    vi.mocked(serveQueueEntry).mockResolvedValue({ status: 200 } as Awaited<ReturnType<typeof serveQueueEntry>>);
    vi.mocked(updateQueueEntry).mockResolvedValue({ status: 201 } as Awaited<ReturnType<typeof updateQueueEntry>>);
    vi.mocked(requeueQueueEntry).mockResolvedValue({ status: 200 });
    mockMutateQueueEntries.mockResolvedValue([]);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      concepts: {
        defaultTransitionStatus: 'some-default-transition-status',
      },
      defaultIdentifierTypes: ['05ee9cf4-7242-4a17-b4d4-00f707265c8a', 'f85081e2-b4be-4e48-b3a4-7994b69bb101'],
    } as ConfigObject);
  });

  it('renders modal content', () => {
    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText(/Serve patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient name:/i)).toBeInTheDocument();
  });

  it('handles requeueing patient', async () => {
    const user = userEvent.setup();

    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    await user.click(screen.getByText('Requeue'));

    expect(requeueQueueEntry).toHaveBeenCalledWith(
      'Requeued',
      mockQueueEntryAlice.queue.uuid,
      mockQueueEntryAlice.uuid,
    );
  });

  it('handles serving patient', async () => {
    const user = userEvent.setup();

    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    await user.click(screen.getByText('Serve'));

    expect(updateQueueEntry).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
    expect(serveQueueEntry).toHaveBeenCalled();
  });

  // `serveQueueEntry` here is a second request chained off `updateQueueEntry`'s success, so the
  // rejection handler on that first request does not cover it. Without one of its own a failure
  // escapes as an unhandled rejection: the crash overlay O3-5666 is about, one click further on.
  it('reports a failed serve request in a snackbar instead of rejecting', async () => {
    const user = userEvent.setup();
    vi.mocked(serveQueueEntry).mockRejectedValue(new Error('Failed to fetch'));

    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    await user.click(screen.getByText('Serve'));

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'error', subtitle: 'Failed to fetch' }),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(closeModal).not.toHaveBeenCalled();
  });

  it('falls back to a generic message when the failed serve request carries none', async () => {
    const user = userEvent.setup();
    vi.mocked(serveQueueEntry).mockRejectedValue(new Error(''));

    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    await user.click(screen.getByText('Serve'));

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'error', subtitle: 'An unknown error occurred' }),
    );
  });

  // `updateQueueEntry` has already succeeded when this request fails, so the entry has ended and
  // been replaced by one carrying the transition status. Saying "error calling patient" here told
  // the user nothing had happened when the patient had in fact moved on, and left the table behind
  // the modal showing a status that is no longer true, with nothing to revalidate it.
  it('says the patient has moved on when only the ticket display request fails', async () => {
    const user = userEvent.setup();
    vi.mocked(serveQueueEntry).mockRejectedValue(new Error('Failed to fetch'));

    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    await user.click(screen.getByText('Serve'));

    expect(updateQueueEntry).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'The patient has been moved on in the queue, but the ticket display was not updated',
        subtitle: 'Failed to fetch',
      }),
    );
    expect(mockMutateQueueEntries).toHaveBeenCalled();
  });

  // The queue table's row actions guard their own failure reporting, because a throw while
  // reporting escapes a rejection handler as the unhandled rejection the report replaces. This
  // modal is the other path the change touches and was not guarded.
  it.each([
    ['the serve request', () => vi.mocked(serveQueueEntry).mockRejectedValue(new Error('Failed to fetch')), 'Serve'],
    ['the queue entry update', () => vi.mocked(updateQueueEntry).mockRejectedValue(new Error('nope')), 'Serve'],
    ['the requeue request', () => vi.mocked(requeueQueueEntry).mockRejectedValue(new Error('nope')), 'Requeue'],
  ])('does not reject when reporting a failed %s itself fails', async (_name, arrangeFailure, button) => {
    const user = userEvent.setup();
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      arrangeFailure();
      mockShowSnackbar.mockImplementationOnce(() => {
        throw new Error('snackbar store unavailable');
      });
      render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={vi.fn()} />);

      await user.click(screen.getByText(button));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Reporting a queue entry failure in the "Serve patient" modal failed'),
        expect.any(Error),
      );
      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });

  // These two handlers read `error.message`, which is the wrapper's "Server responded with 500 ..."
  // rather than the wording the server itself sent, and which is not necessarily a string — and a
  // non-string in a snackbar subtitle is a React render crash. `getErrorMessage` does both jobs.
  it.each([
    ['the queue entry update fails', () => vi.mocked(updateQueueEntry), 'Serve'],
    ['requeueing fails', () => vi.mocked(requeueQueueEntry), 'Requeue'],
  ])('shows the message the server sent when %s', async (_name, mockedRequest, button) => {
    const user = userEvent.setup();
    mockedRequest().mockRejectedValue({
      message: 'Server responded with 500 (Internal Server Error) for url /ws/rest/v1/queue-entry',
      responseBody: { error: { message: 'Cannot transition a queue entry that has already ended' } },
    });
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={vi.fn()} />);

    await user.click(screen.getByText(button));

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: 'Error updating queue entry',
        subtitle: 'Cannot transition a queue entry that has already ended',
      }),
    );
  });

  it.each([
    ['the queue entry update fails', () => vi.mocked(updateQueueEntry), 'Serve'],
    ['requeueing fails', () => vi.mocked(requeueQueueEntry), 'Requeue'],
  ])(
    'falls back to a generic message when %s with a message that is not text',
    async (_name, mockedRequest, button) => {
      const user = userEvent.setup();
      mockedRequest().mockRejectedValue({ message: { unexpectedlyNotAString: true } });
      render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={vi.fn()} />);

      await user.click(screen.getByText(button));

      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'error', subtitle: 'An unknown error occurred' }),
      );
    },
  );

  // Every call to `mutateQueueEntries` here is made from a promise handler, so a re-read that fails
  // would otherwise leave an unhandled rejection of its own on the success path.
  it('does not reject when re-reading the queue entries fails', async () => {
    const user = userEvent.setup();
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', onUnhandled);
    try {
      mockMutateQueueEntries.mockRejectedValue(new Error('re-read failed'));
      render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={vi.fn()} />);

      await user.click(screen.getByText('Serve'));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Re-reading the queue entries failed'),
        expect.any(Error),
      );
      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });
});

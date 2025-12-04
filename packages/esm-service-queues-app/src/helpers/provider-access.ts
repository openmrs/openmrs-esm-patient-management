import { type QueueEntry } from '../types';

/**
 * Determines if the current provider can work on a queue entry.
 *
 * Rules:
 * - Provider can work on patients assigned to them
 * - Provider can work on patients not assigned to any provider
 * - Provider CANNOT work on patients assigned to another provider
 *
 * @param queueEntry - The queue entry to check
 * @param currentProviderUuid - UUID of the currently logged in provider
 * @returns true if provider can work on this queue entry, false otherwise
 */
export function canProviderWorkOnQueueEntry(queueEntry: QueueEntry, currentProviderUuid: string | undefined): boolean {
  // If no current provider (shouldn't happen in normal cases), allow access
  if (!currentProviderUuid) {
    return true;
  }

  // If queue entry has no assigned provider, anyone can work on it
  if (!queueEntry.providerWaitingFor) {
    return true;
  }

  // If queue entry is assigned to the current provider, they can work on it
  if (queueEntry.providerWaitingFor.uuid === currentProviderUuid) {
    return true;
  }

  // Queue entry is assigned to another provider
  return false;
}

import { endPatientStatus, type MappedVisitQueueEntry } from '../active-visits/active-visits-table.resource';

export async function batchClearQueueEntries(queueEntries: Array<MappedVisitQueueEntry>) {
  const endedAt = new Date();
  return await Promise.all(queueEntries.map((qe) => endPatientStatus(qe?.queueUuid, qe?.queueEntryUuid, endedAt)));
}

import { endPatientStatus } from '../../service-queues.resource';
import { type QueueEntry } from '../../types';

export async function batchClearQueueEntries(queueEntries: Array<QueueEntry>) {
  const endedAt = new Date();
  return await Promise.all(queueEntries.map((qe) => endPatientStatus(qe?.queue.uuid, qe?.uuid, endedAt)));
}

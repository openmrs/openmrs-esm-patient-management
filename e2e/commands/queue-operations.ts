import dayjs from 'dayjs';
import { type APIRequestContext, expect } from '@playwright/test';
import { type QueueEntry } from './types';

// Reference application metadata, as hardcoded in service-queues.spec.ts.
const outpatientConsultationQueue = '13b656d3-e141-11ee-bad2-0242ac120002';
const notUrgentPriority = 'f4620bfa-3625-4883-bd3f-84c2cce14470';
const waitingStatus = '51ae5e4d-b72b-4912-bf31-a17efb690aeb';

/** Adds a patient to a queue. The visit must be active, otherwise the backend rejects the entry. */
export const addQueueEntry = async (
  api: APIRequestContext,
  patientId: string,
  visitUuid: string,
  queueUuid?: string,
): Promise<QueueEntry> => {
  const queueEntryRes = await api.post('queue-entry', {
    data: {
      queue: queueUuid || outpatientConsultationQueue,
      patient: patientId,
      visit: visitUuid,
      priority: notUrgentPriority,
      status: waitingStatus,
      startedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    },
  });

  await expect(queueEntryRes.ok()).toBeTruthy();
  return await queueEntryRes.json();
};

import { openmrsFetch, parseDate, toDateObjectStrict, toOmrsIsoString } from '@openmrs/esm-framework';
import { endPatientStatus, MappedVisitQueueEntry } from '../active-visits/active-visits-table.resource';

export async function batchClearQueueEntries(
  queueEntries: Array<MappedVisitQueueEntry>,
  abortController: AbortController,
) {
  // number of concurrent requests in one batch
  const batchSize = 10;
  // request counter
  let curReq = 0;
  // as long as there are items in the list continue to form batches
  while (curReq < queueEntries.length) {
    const end = queueEntries.length < curReq + batchSize ? queueEntries.length : curReq + batchSize;
    const concurrentReq = new Array(batchSize);
    const endedAt = toDateObjectStrict(toOmrsIsoString(new Date()));
    for (let index = curReq; index < end; index++) {
      await Promise.all([
        endPatientStatus(queueEntries[index]?.queueUuid, abortController, queueEntries[index]?.queueEntryUuid, endedAt),
      ]);

      concurrentReq.push(
        openmrsFetch(`/ws/rest/v1/visit/${queueEntries[index].visitUuid}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: abortController.signal,
          body: {
            location: queueEntries[index]?.visitLocation,
            startDatetime: parseDate(queueEntries[index]?.visitStartDateTime),
            visitType: queueEntries[index]?.visitTypeUuid,
            stopDatetime: new Date(),
          },
        }),
      );
      curReq++;
    }
    // wait until all promises are done or one promise is rejected
    return await Promise.all(concurrentReq)
      .then((res) => {
        return res;
      })
      .catch((error) => {
        return error;
      });
  }
}

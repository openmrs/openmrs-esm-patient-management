import dayjs from 'dayjs';
export const spaBasePath = `${window.spaBase}/home`;
export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
export const startOfDay = dayjs(new Date().setUTCHours(0, 0, 0, 0)).format(omrsDateFormat);
export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const time12HourFormatRegexPattern = '^(1[0-2]|0?[1-9]):[0-5][0-9]$';

export const serviceQueuesPatientSearchWorkspace = 'create-queue-entry-workspace';

export const queueEntryCustomRepresentation =
  'custom:(uuid,display,queue:(uuid,display,name,location:(uuid,display),service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display)),status,patient:(uuid,display),visit:(uuid,display,startDatetime),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

// Error codes
export const DUPLICATE_QUEUE_ENTRY_ERROR_CODE = '[queue.entry.duplicate.patient]';
export const QUEUE_ENTRY_ALREADY_ENDED_ERROR = 'queue entry that has already ended';

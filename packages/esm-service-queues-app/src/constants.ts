import dayjs from 'dayjs';
export const spaBasePath = `${window.spaBase}/home`;
export const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
export const startOfDay = dayjs(new Date().setUTCHours(0, 0, 0, 0)).format(omrsDateFormat);
export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const time12HourFormatRegexPattern = '^(1[0-2]|0?[1-9]):[0-5][0-9]$';

export const serviceQueuesPatientSearchWorkspace = 'create-queue-entry-workspace';
export const serviceQueuesVisitNotesWorkspace = 'service-queues-visit-notes-workspace';
export const serviceQueuesPatientVitalsWorkspace = 'service-queues-patient-vitals-workspace';
export const serviceQueuesPatientFormEntryWorkspace = 'service-queues-patient-form-entry-workspace';

export const queueEntryCustomRepresentation =
  'custom:(uuid,display,queue:(uuid,display,name,location:(uuid,display),service:(uuid,display),allowedPriorities:(uuid,display),allowedStatuses:(uuid,display)),status,patient:(uuid,display),visit:(uuid,display,startDatetime),priority,priorityComment,sortWeight,startedAt,endedAt,locationWaitingFor,queueComingFrom,providerWaitingFor,previousQueueEntry)';

/**
 * Feeds the shared `visit-summary` extension, which reads many of these fields unguarded — omitting
 * `obs.groupMembers.display`, for example, throws while rendering any obs group. Kept identical to the
 * visits-widget representation in openmrs-esm-patient-chart (`visit/visits-widget/visit.resource.tsx`), apart
 * from `diagnoses.certainty` which its encounters table reads.
 */
export const visitCustomRepresentation =
  'custom:(uuid,location,encounters:(uuid,diagnoses:(uuid,display,rank,diagnosis,certainty,voided),form:(uuid,display,name,description,encounterType,version,resources:(uuid,display,name,valueReference)),encounterDatetime,orders:full,obs:(uuid,concept:(uuid,display,conceptClass:(uuid,display)),display,groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display),value,obsDatetime),encounterType:(uuid,display,viewPrivilege,editPrivilege),encounterProviders:(uuid,display,encounterRole:(uuid,display),provider:(uuid,person:(uuid,display)))),visitType:(uuid,name,display),startDatetime,stopDatetime,patient,attributes:(attributeType:ref,display,uuid,value)';

// Error codes
export const DUPLICATE_QUEUE_ENTRY_ERROR_CODE = '[queue.entry.duplicate.patient]';
export const QUEUE_ENTRY_ALREADY_ENDED_ERROR = 'queue entry that has already ended';

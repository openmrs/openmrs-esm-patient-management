import { type Visit, type Location } from '@openmrs/esm-framework';
import {
  type Concept,
  type MappedQueueEntry,
  type Queue,
  type QueueEntry,
} from '../packages/esm-service-queues-app/src/types';
import { mockPatientAlice, mockPatientBrian } from './patient.mock';

// Priorities:
export const mockServiceTriage: Concept = {
  uuid: '00000000-0000-0000-0000-000000000001',
  display: 'Triage',
};
export const mockServiceSurgery: Concept = {
  uuid: '00000000-0000-0000-0000-000000000002',
  display: 'Surgery',
};

// Priorities:
export const mockPriorityNonUrgent: Concept = {
  uuid: '00000000-0000-0000-0000-000000000001',
  display: 'Non urgent',
};
export const mockPriorityUrgent: Concept = {
  uuid: '00000000-0000-0000-0000-000000000002',
  display: 'Urgent',
};

// Statuses:
export const mockStatusWaiting: Concept = {
  uuid: '00000000-0000-0000-0000-000000000010',
  display: 'Waiting',
};
export const mockStatusInService: Concept = {
  uuid: '00000000-0000-0000-0000-000000000020',
  display: 'In Service',
};
export const mockStatusWaitingForTransfer: Concept = {
  uuid: '00000000-0000-0000-0000-000000000030',
  display: 'Waiting for Transfer',
};

// Locations:
export const mockLocationTriage: Location = {
  uuid: '00000000-0000-0000-0000-000000000030',
  display: 'Triage',
};
export const mockLocationSurgery: Location = {
  uuid: '00000000-0000-0000-0000-000000000030',
  display: 'Surgery',
};

// Queues:
export const mockQueueTriage: Queue = {
  uuid: '00000000-0000-0000-0001-000000000000',
  display: 'Triage',
  name: 'Triage',
  description: '',
  location: mockLocationTriage,
  service: mockServiceTriage,
  allowedPriorities: [mockPriorityNonUrgent, mockPriorityUrgent],
  allowedStatuses: [mockStatusWaiting, mockStatusInService],
};

export const mockQueueSurgery: Queue = {
  uuid: '00000000-0000-0000-0002-000000000000',
  display: 'Surgery',
  name: 'Surgery',
  description: '',
  location: mockLocationSurgery,
  service: mockServiceSurgery,
  allowedPriorities: [mockPriorityNonUrgent, mockPriorityUrgent],
  allowedStatuses: [mockStatusWaiting, mockStatusInService, mockStatusWaitingForTransfer],
};

export const mockQueues = [mockQueueTriage, mockQueueSurgery];

// Queues Entries:
export const mockQueueEntryBrian: QueueEntry = {
  uuid: '8824d1e4-8513-4a78-bcec-37173f417f18',
  display: mockPatientBrian.display,
  endedAt: null,
  locationWaitingFor: null,
  patient: mockPatientBrian,
  priority: mockPriorityNonUrgent,
  priorityComment: null,
  providerWaitingFor: null,
  queue: mockQueueTriage,
  startedAt: '2024-01-01T00:00:00.000+0000',
  status: mockStatusWaiting,
  visit: {
    uuid: '090386ff-ae85-45cc-8a01-25852099c5ae',
    display: 'Facility Visit @ Outpatient Clinic - 04/04/2022 07:22',
  } as Visit,
  sortWeight: 0,
  queueComingFrom: null,
};

export const mockQueueEntryAlice: QueueEntry = {
  uuid: '00000000-8513-4a78-bcec-37173f417f18',
  display: mockPatientAlice.display,
  endedAt: null,
  locationWaitingFor: null,
  patient: mockPatientAlice,
  priority: mockPriorityNonUrgent,
  priorityComment: null,
  providerWaitingFor: null,
  queue: mockQueueSurgery,
  startedAt: '2024-01-02T00:00:00.000+0000',
  status: mockStatusWaiting,
  visit: {
    uuid: 'c90386ff-ae85-45cc-8a01-25852099c5ae',
    display: 'Facility Visit @ Outpatient Clinic - 04/03/2022 07:22',
  } as Visit,
  sortWeight: 0,
  queueComingFrom: mockQueueTriage,
};

export const mockQueueEntries = [mockQueueEntryBrian, mockQueueEntryAlice];

export const mockMappedQueueEntry: MappedQueueEntry = {
  id: '8824d1e4-8513-4a78-bcec-37173f417f18',
  name: 'Brian Johnson',
  patientAge: '32',
  patientSex: 'F',
  patientDob: '13 — Apr — 2020',
  patientUuid: 'eecfaf7b-a768-42af-9db8-4bbfe3644901',
  priority: mockPriorityNonUrgent,
  priorityComment: '',
  queueEntryUuid: '8824d1e4-8513-4a78-bcec-37173f417f18',
  queue: mockQueueTriage,
  status: mockStatusWaiting,
  visitStartDateTime: '2020-02-01T00:00:00.000+0000',
  visitType: 'Facility Visit',
  visitUuid: 'b90d8438-a0db-4318-a57e-cda773b21433',
  waitTime: '12362',
  queueLocation: 'Triage',
  sortWeight: '0',
};

export const mockMappedQueueEntries = {
  data: [
    {
      id: 'fa1e98f1-f002-4174-9e55-34d60951e710',
      encounters: [],
      name: 'Eric Test Ric',
      patientAge: '32',
      patientSex: 'F',
      patientDob: '13 — Apr — 2020',
      patientUuid: 'eecfaf7b-a768-42af-9db8-4bbfe3644901',
      priority: 'Not Urgent',
      priorityComment: '',
      priorityUuid: 'f4620bfa-3625-4883-bd3f-84c2cce14470',
      queueEntryUuid: '712289ab-32c0-430f-87b6-d9c1e4e4686e',
      queueUuid: 'cbe2cd1d-1884-40fd-92ed-ee357783b450',
      service: 'Triage',
      status: 'Waiting',
      statusUuid: '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
      visitStartDateTime: '2020-02-01T00:00:00.000+0000',
      visitType: 'Facility Visit',
      visitUuid: 'b90d8438-a0db-4318-a57e-cda773b21433',
      waitTime: '12362',
    },
    {
      id: '2f85d611-5bb9-4bca-b6f8-661517df86c9',
      encounters: [],
      name: 'John Smith',
      patientAge: '32',
      patientSex: 'F',
      patientDob: '13 — Apr — 2020',
      patientUuid: 'eecfaf7b-a768-42af-9db8-4bbfe3644901',
      priority: 'Emergency',
      priorityComment: '',
      priorityUuid: 'f4620bfa-3625-4883-bd3f-84c2cce14470',
      queueEntryUuid: '5f017eb0-b035-4acd-b284-da45f5067502',
      queueUuid: 'cbe2cd1d-1884-40fd-92ed-ee357783b450',
      service: 'Clinical consultation',
      status: 'In Service',
      statusUuid: '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
      visitStartDateTime: '2020-02-01T00:00:00.000+0000',
      visitType: 'Facility Visit',
      visitUuid: 'b90d8438-a0db-4318-a57e-cda773b21433',
      waitTime: '12362',
    },
  ],
};

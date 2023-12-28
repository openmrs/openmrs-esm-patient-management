export const mockServiceData = [
  { uuid: '176052c7-5fd4-4b33-89cc-7bae6848c65a', display: 'Clinical consultation' },
  { uuid: 'd80ff12a-06a7-11ed-b939-0242ac120002', display: 'Triage' },
];

export const mockVisitQueueEntries = [
  {
    uuid: 'fa1e98f1-f002-4174-9e55-34d60951e710',
    visit: {
      uuid: 'c90386ff-ae85-45cc-8a01-25852099c5ae',
      display: 'Facility Visit @ Outpatient Clinic - 04/03/2022 07:22',
    },
    queueEntry: {
      uuid: '712289ab-32c0-430f-87b6-d9c1e4e4686e',
      display: 'Eric Test Ric',
      priorityComment: 'Needs Triage',
      sortWeight: 0,
      startedAt: '2022-03-04T09:50:54.000+0000',
      endedAt: null,
      queue: {
        uuid: '6a97bd65-3a9a-4fab-ae8f-be59dd4ddd87',
        display: 'Triage',
        name: 'Triage',
        description: 'Queue for patients waiting for triage',
        service: {
          display: 'Triage',
        },
      },
      status: {
        uuid: 'aaec62b1-4b03-4166-ada7-230cb4b4aaaa',
        display: 'Waiting',
        links: [
          {
            rel: 'self',
            uri: 'http://openmrs:8080/openmrs/ws/rest/v1/concept/aaec62b1-4b03-4166-ada7-230cb4b4aaaa',
          },
        ],
      },
      patient: {
        uuid: 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d',
        display: '10000F1 - Eric Test Ric',
        person: {
          age: '32',
          gender: 'F',
        },
      },
      priority: {
        uuid: 'f9684018-a4d3-4d6f-9dd5-b4b1e89af3e7',
        display: 'Not Urgent',
      },
      locationWaitingFor: null,
      providerWaitingFor: null,
    },
  },
  {
    uuid: '2f85d611-5bb9-4bca-b6f8-661517df86c9',
    visit: {
      uuid: '6b3e233d-2b44-40ca-b0c8-c5a57a8c51b6',
      display: 'Home Visit @ Outpatient Clinic - 09/03/2022 21:08',
    },
    queueEntry: {
      uuid: '5f017eb0-b035-4acd-b284-da45f5067502',
      display: 'John Smith',
      priorityComment: 'Needs immediate assistance',
      sortWeight: 0,
      startedAt: '2022-03-09T13:50:54.000+0000',
      endedAt: null,
      queue: {
        uuid: 'c187d78b-5c54-49bf-a0f8-b7fb6034d36d',
        display: 'Clinical Consultation',
        name: 'Clinical Consultation',
        description: 'A queue for patients for a clincal consultation i.e. Doctor, Clinician',
        service: {
          display: 'Clinical Consultation',
        },
      },
      status: {
        uuid: 'aaec62b1-4b03-4166-ada7-230cb4b4aaaa',
        display: 'Waiting',
      },
      patient: {
        uuid: '53568469-f652-470d-95e8-13131914286b',
        display: '10000JT - John Smith',
        person: {
          age: '27',
          gender: 'M',
        },
      },
      priority: {
        uuid: 'b6a84ad0-c5e6-4a37-896e-5b7a0bccfd6c',
        display: 'Emergency',
      },
      locationWaitingFor: null,
      providerWaitingFor: null,
    },
  },
];

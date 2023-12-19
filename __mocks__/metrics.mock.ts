export const mockMetrics = {
  activeVisitsCount: 100,
  averageMinutes: 28,
  waitTime: {
    queue: 'Clinical Consultation',
    averageWaitTime: 69.0,
  },
};

export const mockServices = [
  { uuid: '176052c7-5fd4-4b33-89cc-7bae6848c65a', display: 'Clinical consultation' },
  { uuid: 'd80ff12a-06a7-11ed-b939-0242ac120002', display: 'Triage' },
];

export const mockServiceTypes = {
  data: [
    {
      display: 'Clinical Consulltation',
      uuid: '7bff050e-9a83-4fdb-9212-1a4c2cee349b',
    },
    {
      display: 'Lab Testing',
      uuid: '0e960ced-d35e-43de-b87f-bc08ef3b6ec3',
    },
    {
      display: 'Triage',
      uuid: 'dbc32cf4-e11d-4006-b398-c71204cfc0d0',
    },
  ],
};

export const mockStatus = [
  { uuid: '1b67146f-b23b-4492-94ef-6255c137a333', display: 'Finished service' },
  { uuid: '5c6a7c68-d671-43a2-887a-0fa65c5f20c8', display: 'Waiting' },
];

export const mockPriorities = [
  { uuid: '1ec10eee-330e-49b0-8ceb-c76af8e84c9e', display: 'Emergency' },
  { uuid: 'bf92b64c-2fa4-44aa-93d0-40f17ec1b433', display: 'Not urgent' },
];

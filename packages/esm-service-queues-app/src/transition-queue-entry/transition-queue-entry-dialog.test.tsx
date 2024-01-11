import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { navigate } from '@openmrs/esm-framework';
import { serveQueueEntry, updateQueueEntry } from '../active-visits/active-visits-table.resource';
import { requeueQueueEntry } from './transition-queue-entry.resource';
import TransitionQueueEntryModal from './transition-queue-entry-dialog.component';

const mockedNavigate = navigate as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useTranslation: () => ({ t: jest.fn((key) => key) }),
  navigate: jest.fn(),
  toOmrsIsoString: jest.fn(),
  toDateObjectStrict: jest.fn(),
  useConfig: jest.fn(() => ({
    concepts: {
      defaultTransitionStatus: 'some-default-transition-status',
    },
    defaultIdentifierTypes: [
      {
        fieldName: 'openMrsId',
        format: null,
        identifierSources: [
          {
            uuid: '8549f706-7e85-4c1d-9424-217d50a2988b',
            name: 'Generator for OpenMRS ID',
            description: 'Generator for OpenMRS ID',
            baseCharacterSet: '0123456789ACDEFGHJKLMNPRTUVWXY',
            prefix: '',
          },
        ],
        isPrimary: true,
        name: 'OpenMRS ID',
        required: true,
        uniquenessBehavior: 'UNIQUE',
        uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
      },
    ],
  })),
}));

jest.mock('../active-visits/active-visits-table.resource', () => ({
  useVisitQueueEntries: jest.fn(() => ({ mutate: jest.fn() })),
  serveQueueEntry: jest.fn(() => Promise.resolve({ status: 200 })),
  updateQueueEntry: jest.fn(() => Promise.resolve({ status: 201 })),
}));

jest.mock('./transition-queue-entry.resource', () => ({
  requeueQueueEntry: jest.fn(() => Promise.resolve({ status: 200 })),
}));

describe('TransitionQueueEntryModal', () => {
  const queueEntry = {
    visitUuid: 'c90386ff-ae85-45cc-8a01-25852099c5ae',
    identifiers: ['100GEJ'],
    queueUuid: 'fa1e98f1-f002-4174-9e55-34d60951e710',
    queueEntryUuid: '712289ab-32c0-430f-87b6-d9c1e4e4686e',
    patientUuid: 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d',
    priorityUuid: 'f9684018-a4d3-4d6f-9dd5-b4b1e89af3e7',
    name: 'John Doe',
  };

  it('renders modal content', () => {
    const closeModal = jest.fn();
    render(<TransitionQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);

    expect(screen.getByText('Serve patient')).toBeInTheDocument();
    expect(screen.getByText(/Patient name :/i)).toBeInTheDocument();
  });

  it('handles requeueing patient', async () => {
    const user = userEvent.setup();

    const closeModal = jest.fn();
    render(<TransitionQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);

    await user.click(screen.getByText('Requeue'));

    expect(requeueQueueEntry).toHaveBeenCalledWith('Requeued', queueEntry.queueUuid, queueEntry.queueEntryUuid);
  });

  it('handles serving patient', async () => {
    const user = userEvent.setup();

    const closeModal = jest.fn();
    render(<TransitionQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);

    await user.click(screen.getByText('Serve'));

    expect(updateQueueEntry).toHaveBeenCalled();
    expect(serveQueueEntry).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalled();
  });
});

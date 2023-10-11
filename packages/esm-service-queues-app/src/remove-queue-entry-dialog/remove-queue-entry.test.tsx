import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RemoveQueueEntryDialog from './remove-queue-entry.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  voidQueueEntry: jest.fn(),
  showNotification: jest.fn(),
  useConfig: jest.fn(() => ({
    visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
  })),
}));

describe('RemoveQueueEntryDialog', () => {
  const queueEntry = {
    queueUuid: 'fa1e98f1-f002-4174-9e55-34d60951e710',
    queueEntryUuid: '712289ab-32c0-430f-87b6-d9c1e4e4686e',
    visitUuid: 'c90386ff-ae85-45cc-8a01-25852099c5ae',
    patientUuid: 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d',
  };

  it('renders dialog content', () => {
    const closeModal = jest.fn();
    render(<RemoveQueueEntryDialog queueEntry={queueEntry} closeModal={closeModal} />);

    expect(screen.getByText('Service queue')).toBeInTheDocument();
    expect(screen.getByText('Remove patient from queue and end active visit?')).toBeInTheDocument();
    expect(screen.getByText(/Ending this visit will remove this patient/)).toBeInTheDocument();

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('End Visit')).toBeInTheDocument();
  });

  it('calls closeModal when Cancel button is clicked', () => {
    const closeModal = jest.fn();
    render(<RemoveQueueEntryDialog queueEntry={queueEntry} closeModal={closeModal} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});

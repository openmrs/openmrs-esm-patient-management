import React from 'react';
import { render, screen } from '@testing-library/react';
import QueueTable from './queue-table.component';
import { usePagination } from '@openmrs/esm-framework';

// --- Mocks ---
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any, str: any) => str }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  isDesktop: jest.fn(() => true),
  useLayoutType: jest.fn(() => 'desktop'),
  usePagination: jest.fn(),
}));

jest.mock('./cells/columns.resource', () => ({
  useColumns: () => [
    {
      key: 'name',
      header: 'Name',
      CellComponent: ({ queueEntry }: any) => <span>{queueEntry.patient.display}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      CellComponent: ({ queueEntry }: any) => <span>{queueEntry.status.display}</span>,
    },
  ],
}));

describe('QueueTable', () => {
  const mockQueueEntries = [
    {
      uuid: 'entry-1',
      patient: { display: 'John Doe' },
      status: { display: 'Waiting' },
    },
    {
      uuid: 'entry-2',
      patient: { display: 'Jane Smith' },
      status: { display: 'In Consultation' },
    },
  ] as any; // Cast to 'any' to avoid mocking the entire complex QueueEntry interface

  it('renders "No patients to display" when the list is empty', () => {
    (usePagination as jest.Mock).mockReturnValue({
      goTo: jest.fn(),
      results: [],
      currentPage: 1,
      paginated: false,
    });

    render(<QueueTable queueEntries={[]} queueUuid="q1" statusUuid="s1" />);

    // Assert that the empty state message is displayed
    expect(screen.getByText(/No patients to display/i)).toBeInTheDocument();
  });

  it('renders patient names correctly', () => {
    (usePagination as jest.Mock).mockReturnValue({
      goTo: jest.fn(),
      results: mockQueueEntries,
      currentPage: 1,
      paginated: true,
    });

    render(<QueueTable queueEntries={mockQueueEntries} queueUuid="q1" statusUuid="s1" />);

    // Assert that patient names are rendered in the table
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import VisitFormQueueFields from './visit-form-queue-fields.extension';
import { useFormContext } from 'react-hook-form';

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}));

// Mock the QueueFields child component so we don't need to satisfy its deep dependency tree
jest.mock('./queue-fields.component', () => {
  return function MockQueueFields() {
    return <div data-testid="queue-fields">Service Queue Fields</div>;
  };
});

describe('VisitFormQueueFields', () => {
  const mockSetVisitFormCallbacks = jest.fn();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render queue fields when visit is NOT retrospective (visitStatus is "new")', () => {
    (useFormContext as jest.Mock).mockReturnValue({
      watch: (key: string) => {
        if (key === 'visitStatus') return 'new';
        return null;
      },
    });

    render(
      <VisitFormQueueFields
        setVisitFormCallbacks={mockSetVisitFormCallbacks}
        visitFormOpenedFrom="service-queues-add-patient"
        patientChartConfig={{ showServiceQueueFields: true }}
        patientUuid="test-patient-uuid"
      />,
    );

    expect(screen.getByText(/Service Queue/i)).toBeInTheDocument();
  });

  it('should render queue fields when visit status is "ongoing"', () => {
    (useFormContext as jest.Mock).mockReturnValue({
      watch: (key: string) => {
        if (key === 'visitStatus') return 'ongoing';
        return null;
      },
    });

    render(
      <VisitFormQueueFields
        setVisitFormCallbacks={mockSetVisitFormCallbacks}
        visitFormOpenedFrom="service-queues-add-patient"
        patientChartConfig={{ showServiceQueueFields: true }}
        patientUuid="test-patient-uuid"
      />,
    );

    expect(screen.getByText(/Service Queue/i)).toBeInTheDocument();
  });

  it('should NOT render queue fields when visit IS retrospective (visitStatus is "past")', () => {
    (useFormContext as jest.Mock).mockReturnValue({
      watch: (key: string) => {
        if (key === 'visitStatus') return 'past';
        return null;
      },
    });

    render(
      <VisitFormQueueFields
        setVisitFormCallbacks={mockSetVisitFormCallbacks}
        visitFormOpenedFrom="service-queues-add-patient"
        patientChartConfig={{ showServiceQueueFields: true }}
        patientUuid="test-patient-uuid"
      />,
    );

    expect(screen.queryByText(/Service Queue/i)).not.toBeInTheDocument();
  });
});

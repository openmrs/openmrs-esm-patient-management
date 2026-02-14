import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserHasAccess } from '@openmrs/esm-framework';
import VisitFormQueueFields, { PRIVILEGE_RDE_ACCESS } from './visit-form-queue-fields.extension';
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

const mockUserHasAccess = UserHasAccess as jest.Mock;

describe('VisitFormQueueFields', () => {
  const mockSetVisitFormCallbacks = jest.fn();

  beforeEach(() => {
    // Default: UserHasAccess renders children (user has privilege)
    mockUserHasAccess.mockImplementation((props: any) => props.children);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render queue fields when visit is NOT retrospective and user has RDE privilege', () => {
    (useFormContext as jest.Mock).mockReturnValue({
      watch: (key: string) => {
        if (key === 'retrospective') return false;
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
    expect(mockUserHasAccess).toHaveBeenCalledWith(
      expect.objectContaining({ privilege: PRIVILEGE_RDE_ACCESS }),
      expect.anything(),
    );
  });

  it('should NOT render queue fields when visit IS retrospective', () => {
    (useFormContext as jest.Mock).mockReturnValue({
      watch: (key: string) => {
        if (key === 'retrospective') return true;
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

  it('should NOT render queue fields when user lacks RDE privilege', () => {
    mockUserHasAccess.mockImplementation(() => null);

    (useFormContext as jest.Mock).mockReturnValue({
      watch: (key: string) => {
        if (key === 'retrospective') return false;
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

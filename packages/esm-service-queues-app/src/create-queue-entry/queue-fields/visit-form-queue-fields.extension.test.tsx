import React from 'react';
import { render, screen } from '@testing-library/react';
import VisitFormQueueFields from './visit-form-queue-fields.extension';
import { useFormContext } from 'react-hook-form';

// Mocks setup
jest.mock('react-hook-form', () => ({
  useFormContext: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn().mockReturnValue({}),
}));

jest.mock('./queue-fields.component', () => () => <div data-testid="queue-fields-component">Queue Fields</div>);

describe('VisitFormQueueFields', () => {
  const mockSetVisitFormCallbacks = jest.fn();

  it('should render queue fields when visit is NOT retrospective', () => {
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
      />
    );

    expect(screen.getByTestId('queue-fields-component')).toBeInTheDocument();
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
      />
    );

    expect(screen.queryByTestId('queue-fields-component')).not.toBeInTheDocument();
  });
});
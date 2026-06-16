import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import VisitFormQueueFields from './visit-form-queue-fields.extension';

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
}));

jest.mock('./queue-fields.component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="queue-fields" />),
}));

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

describe('VisitFormQueueFields', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      defaultInitialServiceQueue: 'default-queue',
      concepts: {},
      visitQueueNumberAttributeUuid: 'queue-number-attribute',
    } as ConfigObject);
  });

  it('does not render queue fields for retrospective visits', () => {
    const { container } = render(
      <VisitFormQueueFields
        patientUuid="patient-uuid"
        setVisitFormCallbacks={jest.fn()}
        visitFormOpenedFrom="patient-chart"
        visitStatus="past"
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('queue-fields')).not.toBeInTheDocument();
  });

  it('renders queue fields for ongoing visits when service queue fields are enabled', () => {
    render(
      <VisitFormQueueFields
        patientUuid="patient-uuid"
        patientChartConfig={{ showServiceQueueFields: true }}
        setVisitFormCallbacks={jest.fn()}
        visitFormOpenedFrom="patient-chart"
        visitStatus="ongoing"
      />,
    );

    expect(screen.getByTestId('queue-fields')).toBeInTheDocument();
  });

  it('renders queue fields when opened from service queues add patient flow', () => {
    render(
      <VisitFormQueueFields
        patientUuid="patient-uuid"
        patientChartConfig={{ showServiceQueueFields: false }}
        setVisitFormCallbacks={jest.fn()}
        visitFormOpenedFrom="service-queues-add-patient"
        visitStatus="new"
      />,
    );

    expect(screen.getByTestId('queue-fields')).toBeInTheDocument();
  });
});

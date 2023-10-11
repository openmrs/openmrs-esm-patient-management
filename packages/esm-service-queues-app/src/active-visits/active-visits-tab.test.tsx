import React from 'react';
import { render } from '@testing-library/react';
import ActiveVisitsTabs from './active-visits-tab.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(() => ({
    visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
  })),
}));

describe('ActiveVisitsTabs', () => {
  it('renders the component', () => {
    const { container } = render(<ActiveVisitsTabs />);
    expect(container).toBeInTheDocument();
  });
});

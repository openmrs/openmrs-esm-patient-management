import React from 'react';
import { getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { renderWithSwr } from '../../../../tools/test-utils';
import { configSchema } from '../config-schema';
import WardView from './ward-view.component';

jest.mocked(useConfig).mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
});

const mockedSessionLocation = { uuid: 'abcd', display: 'mock location', links: [] };
jest.mocked(useSession).mockReturnValue({
  sessionLocation: mockedSessionLocation,
  authenticated: true,
  sessionId: 'sessionId',
});

jest.mock('@openmrs/esm-framework', () => {
  return {
    ...jest.requireActual('@openmrs/esm-framework'),
    useLocations: jest.fn().mockImplementation(() => mockLocations.data.results),
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));
const mockedUseParams = useParams as jest.Mock;

describe('WardView:', () => {
  it('renders the session location when no location provided in URL', () => {
    renderWithSwr(<WardView />);
    const header = screen.getByRole('heading', { name: mockedSessionLocation.display });
    expect(header).toBeInTheDocument();
  });

  it('renders the location provided in URL', () => {
    const locationToUse = mockLocations.data.results[0];
    mockedUseParams.mockReturnValueOnce({ locationUuid: locationToUse.uuid });
    renderWithSwr(<WardView />);
    const header = screen.getByRole('heading', { name: locationToUse.display });
    expect(header).toBeInTheDocument();
  });
});

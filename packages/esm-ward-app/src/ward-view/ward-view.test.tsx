import React from 'react';
import { useParams } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useAppContext, useConfig, useFeatureFlag } from '@openmrs/esm-framework';
import { configSchema, type WardConfigObject } from '../config-schema';
import { mockWardPatientGroupDetails, mockWardViewContext } from '../../mock';
import { renderWithSwr } from 'tools';
import { type WardViewContext } from '../types';
import { useObs } from '../hooks/useObs';
import useWardLocation from '../hooks/useWardLocation';
import DefaultWardView from './default-ward/default-ward-view.component';
import WardView from './ward-view.component';

const mockUseConfig = jest.mocked(useConfig<WardConfigObject>);
const mockUseFeatureFlag = jest.mocked(useFeatureFlag);
const mockUseWardLocation = jest.mocked(useWardLocation);
const mockUseParams = jest.mocked(useParams);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock('../hooks/useWardLocation', () =>
  jest.fn().mockReturnValue({
    location: { uuid: 'abcd', display: 'mock location' },
    isLoadingLocation: false,
    errorFetchingLocation: null,
    invalidLocation: false,
  }),
);

jest.mock('../hooks/useObs', () => ({
  useObs: jest.fn(),
}));

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

//@ts-ignore
jest.mocked(useObs).mockReturnValue({
  data: [],
});

const intersectionObserverMock = () => ({
  observe: () => null,
});

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock);

beforeEach(() => {
  const config = getDefaultsFromConfigSchema<WardConfigObject>(configSchema);
  mockUseConfig.mockReturnValue(config);
});

describe('WardView', () => {
  let replacedProperty: jest.ReplaceProperty<any> | null = null;

  it('renders the session location when no location provided in URL', () => {
    renderWithSwr(<DefaultWardView />);
    const header = screen.getByRole('heading', { name: 'mock location' });
    expect(header).toBeInTheDocument();
  });

  it('renders the location provided in URL', () => {
    mockUseParams.mockReturnValueOnce({ locationUuid: 'abcd' });
    renderWithSwr(<DefaultWardView />);
    const header = screen.getByRole('heading', { name: 'mock location' });
    expect(header).toBeInTheDocument();
  });

  it('renders the correct number of occupied and empty beds', async () => {
    renderWithSwr(<DefaultWardView />);
    const emptyBedCards = await screen.findAllByText(/empty bed/i);
    expect(emptyBedCards).toHaveLength(3);
  });

  it('renders admitted patient without bed', async () => {
    renderWithSwr(<DefaultWardView />);
    const admittedPatientWithoutBed = screen.queryByText('Brian Johnson');
    expect(admittedPatientWithoutBed).toBeInTheDocument();
  });

  it('renders all admitted patients even if bed management module not installed', async () => {
    mockUseFeatureFlag.mockReturnValueOnce(false);
    renderWithSwr(<DefaultWardView />);
    const admittedPatientWithoutBed = screen.queryByText('Brian Johnson');
    expect(admittedPatientWithoutBed).toBeInTheDocument();
  });

  it('renders notification for invalid location uuid', () => {
    mockUseWardLocation.mockReturnValueOnce({
      location: null,
      isLoadingLocation: false,
      errorFetchingLocation: null,
      invalidLocation: true,
    });

    renderWithSwr(<WardView />);
    const notification = screen.getByRole('status');
    expect(notification).toBeInTheDocument();
    const invalidText = screen.queryByText('Invalid location specified');
    expect(invalidText).toBeInTheDocument();
  });

  it('should render warning if backend module installed and no beds configured', () => {
    // override the default response so that no beds are returned
    replacedProperty = jest.replaceProperty(mockWardPatientGroupDetails(), 'bedLayouts', []);

    mockUseFeatureFlag.mockReturnValue(true);

    renderWithSwr(<DefaultWardView />);
    const noBedsConfiguredForThisLocation = screen.queryByText('No beds configured for this location');
    expect(noBedsConfiguredForThisLocation).toBeInTheDocument();
  });

  it('should not render warning if backend module installed and no beds configured', () => {
    // override the default response so that no beds are returned
    replacedProperty = jest.replaceProperty(mockWardPatientGroupDetails(), 'bedLayouts', []);
    mockUseFeatureFlag.mockReturnValue(false);

    renderWithSwr(<WardView />);
    const noBedsConfiguredForThisLocation = screen.queryByText('No beds configured for this location');
    expect(noBedsConfiguredForThisLocation).not.toBeInTheDocument();
  });

  afterEach(() => {
    replacedProperty?.restore();
    replacedProperty = null;
  });
});

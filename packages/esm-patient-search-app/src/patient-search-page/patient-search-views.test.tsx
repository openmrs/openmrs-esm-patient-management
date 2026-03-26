import React from 'react';
import { render, screen } from '@testing-library/react';
import { PatientSearchResults } from './patient-search-views.component';

const mockPatientBanner = jest.fn(() => <div data-testid="patient-banner" />);

jest.mock('./patient-banner/banner/patient-banner.component', () => ({
  __esModule: true,
  default: (props) => mockPatientBanner(props),
  PatientBannerSkeleton: () => <div data-testid="patient-banner-skeleton" />,
}));

describe('PatientSearchResults', () => {
  beforeEach(() => {
    mockPatientBanner.mockClear();
  });

  it('passes hideActionsOverflow to patient banners', () => {
    render(
      <PatientSearchResults
        hideActionsOverflow
        searchResults={[{ uuid: 'patient-1' }, { uuid: 'patient-2' }] as any}
      />,
    );

    expect(screen.getAllByTestId('patient-banner')).toHaveLength(2);
    expect(mockPatientBanner.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        hideActionsOverflow: true,
        patientUuid: 'patient-1',
      }),
    );
    expect(mockPatientBanner.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        hideActionsOverflow: true,
        patientUuid: 'patient-2',
      }),
    );
  });
});

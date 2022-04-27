import React from 'react';
import PatientSearch from './patient-search.component';
import { screen, render } from '@testing-library/react';
import * as mockUsePatients from '../hooks/usePatients';
import { mockPatients } from '../../../../__mocks/patient.mock';
import * as openMRSFramework from '@openmrs/esm-framework';
import userEvent from '@testing-library/user-event';

const mockHidePanel = jest.fn();

const testProps = {
  hidePanel: mockHidePanel,
  querySearchTerm: 'Test OpenMRS 3.x',
};

describe('PatientSearch', () => {
  test('should display loading spinner while search is loading', () => {
    spyOn(mockUsePatients, 'usePatients').and.returnValue({ isLoading: true, patients: [] });

    renderPatientSearch();

    expect(screen.getByLabelText(/Active loading indicator/i)).toBeInTheDocument();
  });

  test('should display an error message when an error occurs while searching', () => {
    spyOn(mockUsePatients, 'usePatients').and.returnValue({
      isLoading: false,
      error: { status: '500', statusText: 'Internal Error 500' },
      patients: [],
    });

    renderPatientSearch();

    expect(screen.getByText(/An error occurred while performing search/i)).toBeInTheDocument();
    const errorMessgae =
      'Sorry, there was a an error. You can try to reload this page, or contact the site administrator and quote the error code above.';
    expect(screen.getByText(errorMessgae)).toBeInTheDocument();
  });

  test('should show search results correctly', () => {
    spyOn(mockUsePatients, 'usePatients').and.returnValue({ isLoading: false, error: null, patients: mockPatients });
    spyOn(openMRSFramework, 'useConfig').and.returnValue({
      search: { patientResultUrl: '${openmrsSpaBase}/patient/${patientUuid}/chart' },
    });
    spyOn(openMRSFramework, 'usePagination').and.returnValue({
      totalPages: 6,
      results: mockPatients.slice(0, 5),
      goTo: jest.fn(),
    });

    renderPatientSearch();

    expect(screen.getAllByRole('button', { name: /Start visit/ }).length).toEqual(4);
    expect(screen.getAllByRole('button', { name: /Action/ }).length).toEqual(5);

    const firstPatient = screen.getByText(/^Test 2.13.2 Test$/i);
    expect(firstPatient).toBeInTheDocument();

    userEvent.click(firstPatient);
    expect(mockHidePanel).toHaveBeenCalled();
    expect(openMRSFramework.navigate).toHaveBeenCalledWith({
      to: '${openmrsSpaBase}/patient/ae6c955b-f3b6-47e6-b036-59f2055c2002/chart',
    });
  });
});

function renderPatientSearch() {
  return render(<PatientSearch {...testProps} />);
}

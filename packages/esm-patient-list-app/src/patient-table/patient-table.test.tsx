import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientTable from './patient-table.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  isDesktop: jest.fn(() => true),
}));

describe('PatientTable Component', () => {
  const patients = [
    {
      identifier: '123abced',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      sex: 'Male',
      startDate: '2023-08-10',
      membershipUuid: 'ce7d26fa-e1b4-4e78-a1f5-3a7a5de9c0db',
    },
    {
      identifier: '123abcedfg',
      firstName: 'Jane',
      lastName: 'Smith',
      age: 25,
      sex: 'Female',
      startDate: '2023-08-10',
      membershipUuid: 'ce7d26fa-e1b4-4e78-a1f5-3a7a5de9c0db',
    },
  ];

  const columns = [
    {
      key: 'firstName',
      header: 'First Name',
    },
    {
      key: 'lastName',
      header: 'Last Name',
      link: {
        getUrl: (patient) => `/patient/${patient.id}`,
      },
    },
    {
      key: 'age',
      header: 'Age',
      getValue: (patient) => `${patient.age} years`,
    },
  ];

  const mockedOnSearch = jest.fn();

  const search = {
    onSearch: mockedOnSearch,
    placeHolder: 'Search Patients',
  };

  const mockedOnChange = jest.fn();

  let pagination = {
    usePagination: true,
    currentPage: 1,
    onChange: mockedOnChange,
    pageSize: 10,
    totalItems: 100,
    pagesUnknown: false,
  };

  it('renders table with patient data', () => {
    render(
      <PatientTable
        patients={patients}
        columns={columns}
        search={search}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={true}
        mutateListDetails={jest.fn()}
        mutateListMembers={jest.fn()}
      />,
    );
    expect(screen.getByTestId('patientsTable')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    render(
      <PatientTable
        patients={patients}
        columns={columns}
        search={search}
        pagination={pagination}
        isLoading={true}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={jest.fn()}
        mutateListMembers={jest.fn()}
      />,
    );

    expect(screen.getByTestId('data-table-skeleton')).toBeInTheDocument();
  });

  it('performs search when typing in the search input', async () => {
    render(
      <PatientTable
        patients={patients}
        columns={columns}
        search={search}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={jest.fn()}
        mutateListMembers={jest.fn()}
      />,
    );

    const searchInput = screen.getByPlaceholderText('Search Patients');
    const searchText = 'John Doe';

    fireEvent.change(searchInput, { target: { value: searchText } });

    expect(searchInput).toHaveValue(searchText);
    await waitFor(() => expect(mockedOnSearch).toHaveBeenCalledWith(searchText));
  });
});

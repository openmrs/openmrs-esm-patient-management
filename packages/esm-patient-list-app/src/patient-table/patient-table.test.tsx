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
      id: '123abced',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
    },
    {
      id: '123abcedfg',
      firstName: 'Jane',
      lastName: 'Smith',
      age: 25,
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
      />,
    );

    const searchInput = screen.getByPlaceholderText('Search Patients');
    const searchText = 'John Doe';

    fireEvent.change(searchInput, { target: { value: searchText } });

    expect(searchInput).toHaveValue(searchText);
    await waitFor(() => expect(mockedOnSearch).toHaveBeenCalledWith(searchText));
  });

  //need to fix this test
  xit('calls onChange when clicking pagination buttons', async () => {
    render(
      <PatientTable
        patients={patients}
        columns={columns}
        search={search}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={false}
      />,
    );

    // Click on the next page button
    fireEvent.click(screen.getByRole('button', { name: /Next page/i }));

    // Expect the onChange function to be called with the new page number
    await waitFor(() => expect(mockedOnChange).toHaveBeenCalledWith({ page: 2, pageSize: 10 }));
    //
    expect(pagination.currentPage).toBe(2);
  });
});

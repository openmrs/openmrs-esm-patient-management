import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListDetailsTable from './list-details-table.component';
import { showSnackbar } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => {
  const actual = jest.requireActual('@openmrs/esm-framework');
  return {
    ...actual,
    showSnackbar: jest.fn(),
    useLayoutType: () => 'desktop',
    isDesktop: () => true,
    ExtensionSlot: ({ state }) => (
      <button onClick={() => state.selectPatientAction('new-patient')}>{state.buttonText}</button>
    ),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));

jest.mock('../api/api-remote', () => ({
  addPatientToList: jest.fn(() => Promise.resolve()),
  removePatientFromList: jest.fn(),
}));

describe('ListDetailsTable', () => {
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

  const mockOnChange = jest.fn();

  let pagination = {
    usePagination: true,
    currentPage: 1,
    onChange: mockOnChange,
    pageSize: 10,
    totalItems: 100,
    pagesUnknown: false,
  };

  it('renders table with patient data', () => {
    render(
      <ListDetailsTable
        patients={patients}
        columns={columns}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={true}
        mutateListDetails={jest.fn()}
        mutateListMembers={jest.fn()}
        cohortUuid="test-cohort"
      />,
    );
    expect(screen.getByTestId('patientsTable')).toBeInTheDocument();
  });

  it('renders loading skeleton when loading', () => {
    render(
      <ListDetailsTable
        patients={patients}
        columns={columns}
        pagination={pagination}
        isLoading={true}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={jest.fn()}
        mutateListMembers={jest.fn()}
        cohortUuid="test-cohort"
      />,
    );

    expect(screen.getByTestId('data-table-skeleton')).toBeInTheDocument();
  });

  it('renders add patient button slot', () => {
    render(
      <ListDetailsTable
        patients={patients}
        columns={columns}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={jest.fn()}
        mutateListMembers={jest.fn()}
        cohortUuid="test-cohort"
      />,
    );

    expect(screen.getByText('Add patient to list')).toBeInTheDocument();
  });

  it('adds a new patient to the list when add button is clicked', async () => {
    const mockMutateListDetails = jest.fn();
    const mockMutateListMembers = jest.fn();

    render(
      <ListDetailsTable
        patients={patients}
        columns={columns}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={mockMutateListDetails}
        mutateListMembers={mockMutateListMembers}
        cohortUuid="test-cohort"
      />,
    );

    const addButton = screen.getByText('Add patient to list');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringMatching(/Patient added to list/i),
          kind: 'success',
        }),
      );
    });

    expect(mockMutateListMembers).toHaveBeenCalled();
    expect(mockMutateListDetails).toHaveBeenCalled();
  });
});

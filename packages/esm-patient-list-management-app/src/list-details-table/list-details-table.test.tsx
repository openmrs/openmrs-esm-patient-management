import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ExtensionSlot, isDesktop, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { addPatientToList } from '../api/patient-list.resource';
import ListDetailsTable from './list-details-table.component';

const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockIsDesktop = jest.mocked(isDesktop);
const mockExtensionSlot = jest.mocked(ExtensionSlot);

beforeEach(() => {
  mockUseLayoutType.mockReturnValue('small-desktop');
  mockIsDesktop.mockReturnValue(true);
  mockShowSnackbar.mockImplementation(() => {});
  mockExtensionSlot.mockImplementation(({ state }: any) => (
    <button onClick={() => state.selectPatientAction('new-patient')}>{state.buttonText}</button>
  ));
});

jest.mock('../api/patient-list.resource', () => ({
  addPatientToList: jest.fn().mockResolvedValue({}),
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
        autoFocus={false}
        cohortUuid="test-cohort"
        columns={columns}
        isFetching={false}
        isLoading={false}
        mutateListDetails={jest.fn()}
        mutateListMembers={jest.fn()}
        pagination={pagination}
        patients={patients}
      />,
    );

    expect(screen.getByRole('button', { name: /add patient to list/i })).toBeInTheDocument();
  });

  it('adds a new patient to the list when add button is clicked', async () => {
    const mockMutateListDetails = jest.fn();
    const mockMutateListMembers = jest.fn();
    const user = userEvent.setup();
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

    const addButton = screen.getByRole('button', { name: /add patient to list/i });
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);

    expect(addPatientToList).toHaveBeenCalledWith({
      cohort: 'test-cohort',
      patient: 'new-patient',
      startDate: expect.any(String),
    });
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        subtitle: 'The list is now up to date',
        title: 'Patient added to list',
        kind: 'success',
      }),
    );

    expect(mockMutateListMembers).toHaveBeenCalled();
    expect(mockMutateListDetails).toHaveBeenCalled();
  });
});

import React from 'react';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { isDesktop, launchWorkspace2, showModal, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { addPatientToList } from '../api/patient-list.resource';
import ListDetailsTable from './list-details-table.component';

const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockIsDesktop = vi.mocked(isDesktop);
const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);
const mockShowModal = vi.mocked(showModal);

beforeEach(() => {
  mockUseLayoutType.mockReturnValue('small-desktop');
  mockIsDesktop.mockReturnValue(true);
  mockShowSnackbar.mockImplementation(() => {});
  mockLaunchWorkspace2.mockImplementation(() => {});
  mockShowModal.mockImplementation(() => vi.fn());
});

vi.mock('../api/patient-list.resource', () => ({
  addPatientToList: vi.fn().mockResolvedValue({}),
  removePatientFromList: vi.fn(),
}));

describe('ListDetailsTable', () => {
  const patients = [
    {
      identifier: '123abced',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      sex: 'Male',
      startDate: '2023-08-10',
      uuid: 'patient-uuid-1',
      membershipUuid: 'ce7d26fa-e1b4-4e78-a1f5-3a7a5de9c0db',
    },
    {
      identifier: '123abcedfg',
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      age: 25,
      sex: 'Female',
      startDate: '2023-08-10',
      uuid: 'patient-uuid-2',
      membershipUuid: 'ce7d26fa-e1b4-4e78-a1f5-3a7a5de9c0dc',
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

  const mockOnChange = vi.fn();

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
        mutateListDetails={vi.fn()}
        mutateListMembers={vi.fn()}
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
        mutateListDetails={vi.fn()}
        mutateListMembers={vi.fn()}
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
        mutateListDetails={vi.fn()}
        mutateListMembers={vi.fn()}
        pagination={pagination}
        patients={patients}
      />,
    );

    expect(screen.getByRole('button', { name: /add patient to list/i })).toBeInTheDocument();
  });

  it('launches patient search workspace when add button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ListDetailsTable
        patients={patients}
        columns={columns}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={vi.fn()}
        mutateListMembers={vi.fn()}
        cohortUuid="test-cohort"
      />,
    );

    const addButton = screen.getByRole('button', { name: /add patient to list/i });
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      'patient-list-search-workspace',
      expect.objectContaining({
        initialQuery: '',
        workspaceTitle: 'Add patient to list',
        onPatientSelected: expect.any(Function),
      }),
      expect.objectContaining({
        startVisitWorkspaceName: 'patient-list-start-visit-workspace',
      }),
    );
  });

  it('adds patient to list when onPatientSelected callback is invoked', async () => {
    const mockMutateListDetails = vi.fn();
    const mockMutateListMembers = vi.fn();
    const mockCloseWorkspace = vi.fn();
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
    await user.click(addButton);

    const launchWorkspace2Call = mockLaunchWorkspace2.mock.calls[0];
    const workspaceProps = launchWorkspace2Call[1];
    const onPatientSelected = workspaceProps.onPatientSelected;

    await onPatientSelected('new-patient-uuid', {} as fhir.Patient, vi.fn(), mockCloseWorkspace);

    await waitFor(() => {
      expect(addPatientToList).toHaveBeenCalledWith({
        cohort: 'test-cohort',
        patient: 'new-patient-uuid',
        startDate: expect.any(String),
      });
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

    expect(mockCloseWorkspace).not.toHaveBeenCalled();
  });

  it('renders correct pagination backward and forward button accessibility labels', () => {
    render(
      <ListDetailsTable
        patients={patients}
        columns={columns}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={vi.fn()}
        mutateListMembers={vi.fn()}
        cohortUuid="test-cohort"
      />,
    );

    expect(screen.getByRole('button', { name: /previous page/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
  });

  it('ranks higher fuzzy search score matches first', async () => {
    const user = userEvent.setup();
    const testPatients = [
      {
        identifier: 'ID1',
        name: 'Jack Harrison Nelson',
        sex: 'Male',
        membershipUuid: 'm1',
      },
      {
        identifier: 'ID2',
        name: 'John',
        sex: 'Male',
        membershipUuid: 'm2',
      },
    ];

    const testColumns = [
      {
        key: 'name',
        header: 'Name',
      },
      {
        key: 'identifier',
        header: 'Identifier',
      },
    ];

    render(
      <ListDetailsTable
        patients={testPatients}
        columns={testColumns}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={vi.fn()}
        mutateListMembers={vi.fn()}
        cohortUuid="test-cohort"
      />,
    );

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'jhn');

    await waitFor(() => {
      expect(screen.getByText('Jack Harrison Nelson')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('John');
    expect(rows[1]).toHaveTextContent('ID2');
    expect(rows[2]).toHaveTextContent('Jack Harrison Nelson');
    expect(rows[2]).toHaveTextContent('ID1');
  });

  it('handles patients without identifiers using membershipUuid or uuid and opens remove modal correctly', async () => {
    const user = userEvent.setup();
    const patientsWithoutId = [
      {
        identifier: null,
        name: 'Patient A',
        sex: 'Male',
        membershipUuid: 'mem-uuid-1',
        uuid: 'patient-a-uuid',
      },
      {
        identifier: null,
        name: 'Patient B',
        sex: 'Female',
        membershipUuid: 'mem-uuid-2',
        uuid: 'patient-b-uuid',
      },
    ];

    const testColumns = [
      {
        key: 'name',
        header: 'Name',
      },
    ];

    render(
      <ListDetailsTable
        patients={patientsWithoutId}
        columns={testColumns}
        pagination={pagination}
        isLoading={false}
        autoFocus={false}
        isFetching={false}
        mutateListDetails={vi.fn()}
        mutateListMembers={vi.fn()}
        cohortUuid="test-cohort"
      />,
    );

    const removeButtons = screen.getAllByRole('button', { name: /remove from list/i });
    expect(removeButtons).toHaveLength(2);

    await user.click(removeButtons[1]);

    expect(mockShowModal).toHaveBeenCalledWith(
      'remove-patient-from-list-modal',
      expect.objectContaining({
        patientName: 'Patient B',
        membershipUuid: 'mem-uuid-2',
      }),
    );
  });
});

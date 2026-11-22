import React from 'react';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { isDesktop, launchWorkspace2, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { addPatientToList } from '../api/patient-list.resource';
import ListDetailsTable from './list-details-table.component';

const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockIsDesktop = vi.mocked(isDesktop);
const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

beforeEach(() => {
  mockUseLayoutType.mockReturnValue('small-desktop');
  mockIsDesktop.mockReturnValue(true);
  mockShowSnackbar.mockImplementation(() => {});
  mockLaunchWorkspace2.mockImplementation(() => {});
});

vi.mock('../api/patient-list.resource', () => ({
  addPatientToList: vi.fn().mockResolvedValue({}),
  removePatientFromList: vi.fn(),
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

  it('renders table with patient data', () => {
    render(
      <ListDetailsTable
        patients={patients}
        columns={columns}
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

  describe('with more patients than fit on one page', () => {
    // 15 patients: 10 on the first page and 5 on the second at the default page size.
    const manyPatients = Array.from({ length: 15 }, (_, index) => {
      const number = String(index + 1).padStart(2, '0');
      return {
        name: `Patient ${number}`,
        identifier: `ID-${number}`,
        sex: index % 2 ? 'F' : 'M',
        startDate: '2023-08-10',
        membershipUuid: `membership-${number}`,
        uuid: `patient-${number}`,
      };
    });

    const nameColumns = [
      { key: 'name', header: 'Name' },
      { key: 'identifier', header: 'Identifier' },
    ];

    function renderTable() {
      return render(
        <ListDetailsTable
          cohortUuid="test-cohort"
          columns={nameColumns}
          isLoading={false}
          mutateListDetails={vi.fn()}
          mutateListMembers={vi.fn()}
          patients={manyPatients}
        />,
      );
    }

    const bodyRows = () => screen.getAllByRole('row').slice(1);

    it('shows the first page and the real item range', () => {
      renderTable();

      expect(bodyRows()).toHaveLength(10);
      expect(screen.getByText('Patient 01')).toBeInTheDocument();
      expect(screen.queryByText('Patient 11')).not.toBeInTheDocument();
      expect(screen.getByText(/1–10 of 15 items/)).toBeInTheDocument();
    });

    it('shows the rest of the patients on the next page', async () => {
      const user = userEvent.setup();
      renderTable();

      await user.click(screen.getByRole('button', { name: 'Next page' }));

      expect(bodyRows()).toHaveLength(5);
      expect(screen.getByText('Patient 15')).toBeInTheDocument();
      expect(screen.getByText(/11–15 of 15 items/)).toBeInTheDocument();
    });

    it('finds a patient who is on another page when searching', async () => {
      const user = userEvent.setup();
      renderTable();

      await user.type(screen.getByPlaceholderText('Search this list'), 'Patient 15');

      expect(await screen.findByText('Patient 15')).toBeInTheDocument();
      expect(screen.queryByText('No matching patients to display')).not.toBeInTheDocument();
    });

    it('goes back to the first page when the search changes', async () => {
      const user = userEvent.setup();
      renderTable();

      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(screen.getByText(/11–15 of 15 items/)).toBeInTheDocument();

      // Every patient matches, so the results still span two pages, and the first one is shown.
      await user.type(screen.getByPlaceholderText('Search this list'), 'Patient');

      expect(await screen.findByText(/1–10 of 15 items/)).toBeInTheDocument();
      expect(bodyRows()).toHaveLength(10);
    });

    it('keeps the pagination, including the page size selector, when the page size is larger than the list', async () => {
      const user = userEvent.setup();
      renderTable();

      await user.selectOptions(screen.getByRole('combobox', { name: /items per page/i }), '20');

      expect(bodyRows()).toHaveLength(15);
      expect(screen.getByRole('combobox', { name: /items per page/i })).toBeInTheDocument();

      await user.selectOptions(screen.getByRole('combobox', { name: /items per page/i }), '10');

      expect(bodyRows()).toHaveLength(10);
    });

    it('labels the previous and next page buttons correctly', () => {
      renderTable();

      expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    });
  });
});

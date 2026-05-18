import React from 'react';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { OpenmrsCohortMember, OpenmrsCohort } from '../api/types';
import { showModal, launchWorkspace2 } from '@openmrs/esm-framework';
import { useCohortTypes, usePatientListDetails, usePatientListMembers } from '../api/hooks';
import { deletePatientList } from '../api/patient-list.resource';
import { getByTextWithMarkup } from 'tools';
import ListDetails from './list-details.component';

const mockUsePatientListDetails = vi.mocked(usePatientListDetails);
const mockUsePatientListMembers = vi.mocked(usePatientListMembers);
const mockDeletePatientList = vi.mocked(deletePatientList);
const mockUseCohortTypes = vi.mocked(useCohortTypes);
const mockShowModal = vi.mocked(showModal);
const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

vi.mock('../api/hooks', () => ({
  usePatientListDetails: vi.fn(),
  usePatientListMembers: vi.fn(),
  useCohortTypes: vi.fn(),
}));

vi.mock('../api/patient-list.resource');

const mockPatientListDetails = {
  name: 'Test Patient List',
  description: 'This is a test patient list',
  size: 1,
  startDate: '2023-08-14',
} as OpenmrsCohort;

const mockPatientListMembers = [
  {
    name: 'MINDSCAPE Cohort',
    description:
      'Mental Illness and Neuroimaging Study for Personalized Assessment and Care Evaluation (develops personalized treatment plans for mental illness based on brain imaging and individual factors)',
    patient: {
      person: {
        display: 'John Doe',
        gender: 'Male',
      },
      identifiers: [
        {
          identifier: '100GEJ',
        },
      ],
      uuid: '7cd38a6d-377e-491b-8284-b04cf8b8c6d8',
    },
    attributes: [],
    endDate: null,
    startDate: '2023-08-10',
    uuid: 'ce7d26fa-e1b4-4e78-a1f5-3a7a5de9c0db',
    voided: false,
  },
] as OpenmrsCohortMember[];

const mockCohortTypeList = [
  {
    display: 'sms reminder',
    uuid: 'uuid-2345',
  },
];

describe('ListDetails', () => {
  beforeEach(() => {
    mockUsePatientListDetails.mockReturnValue({
      listDetails: mockPatientListDetails,
      error: null,
      isLoading: false,
      mutateListDetails: vi.fn().mockResolvedValue({}),
    });

    mockUsePatientListMembers.mockReturnValue({
      listMembers: mockPatientListMembers,
      isLoadingListMembers: false,
      error: null,
      mutateListMembers: vi.fn().mockResolvedValue({}),
    });

    mockDeletePatientList.mockResolvedValue({});

    mockUseCohortTypes.mockReturnValue({
      listCohortTypes: mockCohortTypeList,
      isLoading: false,
      error: null,
      mutate: vi.fn().mockReturnValue({}),
    });
  });

  it('renders patient list details page', async () => {
    render(<ListDetails />);

    expect(screen.getByRole('heading', { name: /^test patient list$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /this is a test patient list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /actions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to lists page/i })).toBeInTheDocument();
    expect(screen.getByText(/1 patient/)).toBeInTheDocument();
    expect(getByTextWithMarkup('Created on: 14-Aug-2023')).toBeInTheDocument();
    expect(screen.getByText(/edit name or description/i)).toBeInTheDocument();
    expect(screen.getByText(/delete patient list/i)).toBeInTheDocument();
  });

  it('renders an empty state view if a list has no patients', async () => {
    mockUsePatientListMembers.mockReturnValue({
      listMembers: [],
      isLoadingListMembers: false,
      error: null,
      mutateListMembers: vi.fn().mockResolvedValue({}),
    });

    render(<ListDetails />);

    expect(screen.getByText(/there are no patients in this list/i)).toBeInTheDocument();
  });

  it('opens workspace to edit patient list', async () => {
    const user = userEvent.setup();
    render(<ListDetails />);

    await user.click(screen.getByText('Actions'));
    await user.click(screen.getByText('Edit name or description'));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', {
      patientListDetails: mockPatientListDetails,
      onSuccess: expect.any(Function),
    });
  });

  it('opens delete confirmation modal', async () => {
    const user = userEvent.setup();

    render(<ListDetails />);

    await user.click(screen.getByText('Actions'));
    await user.click(screen.getByText(/delete patient list/i));

    expect(mockShowModal).toHaveBeenCalledWith(
      'delete-patient-list-modal',
      expect.objectContaining({ listName: expect.any(String), onConfirm: expect.any(Function) }),
    );
  });
});

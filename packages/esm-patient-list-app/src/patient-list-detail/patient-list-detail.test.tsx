import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePatientListDetails, usePatientListMembers } from '../api/hooks';
import { showToast } from '@openmrs/esm-framework';
import { deletePatientList } from '../api/api-remote';
import PatientListDetailComponent from './patient-list-detail.component';

const mockedUsePatientListDetails = usePatientListDetails as jest.Mock;
const mockedUsePatientListMembers = usePatientListMembers as jest.Mock;
const mockedDeletePatientList = deletePatientList as jest.Mock;

jest.mock('../api/hooks', () => ({
  usePatientListDetails: jest.fn(),
  usePatientListMembers: jest.fn(),
}));

jest.mock('../api/api-remote');

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  showToast: jest.fn(),
  navigate: jest.fn(),
  ExtensionSlot: jest.fn(),
}));

const mockedPatientListDetails = {
  name: 'Test Patient List',
  description: 'This is a test patient list',
  size: 5,
  startDate: '2023-08-14',
};

const mockedPatientListMembers = [
  {
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
    startDate: '2023-08-10',
  },
];

describe('PatientListDetailComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePatientListDetails.mockReturnValue({
      data: mockedPatientListDetails,
    });

    mockedUsePatientListMembers.mockReturnValue({
      data: mockedPatientListMembers,
    });

    mockedDeletePatientList.mockResolvedValue({});
  });

  it('renders patient list details', async () => {
    render(<PatientListDetailComponent />);

    await waitFor(() => {
      expect(screen.getByText('Test Patient List')).toBeInTheDocument();
      expect(screen.getByText('This is a test patient list')).toBeInTheDocument();
    });
  });

  it('displays patient list members', async () => {
    render(<PatientListDetailComponent />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('100GEJ')).toBeInTheDocument();
    });
  });

  // TODO:  this test is not running. need to fix

  it('opens edit overlay when "Edit Name/ Description" is clicked', () => {
    render(<PatientListDetailComponent />);

    userEvent.click(screen.getByText('Actions'));
    const editBtn = screen.getByText('Edit Name/ Description');
    userEvent.click(editBtn);
  });

  it('deletes patient list and navigates on successful delete', async () => {
    render(<PatientListDetailComponent />);

    await waitFor(() => {
      userEvent.click(screen.getByText('Delete'));
    });

    await waitFor(() => {
      expect(mockedDeletePatientList).toHaveBeenCalledTimes(1);
      expect(showToast).toHaveBeenCalledTimes(1);
    });
  });
});

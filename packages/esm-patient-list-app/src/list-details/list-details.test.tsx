import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePatientListDetails, usePatientListMembers } from '../api/hooks';
import { deletePatientList } from '../api/api-remote';
import { getByTextWithMarkup } from '../../../../tools/test-helpers';
import ListDetails from './list-details.component';

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
  size: 1,
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
    uuid: 'ce7d26fa-e1b4-4e78-a1f5-3a7a5de9c0db',
  },
];

describe('ListDetails', () => {
  beforeEach(() => {
    mockedUsePatientListDetails.mockReturnValue({
      listDetails: mockedPatientListDetails,
    });

    mockedUsePatientListMembers.mockReturnValue({
      listMembers: mockedPatientListMembers,
    });

    mockedDeletePatientList.mockResolvedValue({});
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
    mockedUsePatientListMembers.mockReturnValue({
      listMembers: [],
    });

    render(<ListDetails />);

    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no patients in this list/i)).toBeInTheDocument();
  });

  it('opens overlay with a form when the "Edit name or description" button is clicked', () => {
    render(<ListDetails />);

    userEvent.click(screen.getByText('Actions'));
    const editBtn = screen.getByText('Edit name or description');
    userEvent.click(editBtn);
  });

  it('deletes patient list and navigates back to the list page', async () => {
    render(<ListDetails />);

    await userEvent.click(screen.getByText('Actions'));
    await userEvent.click(screen.getByText(/delete patient list/i));

    expect(screen.getByText(/Are you sure you want to delete this patient list/i)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();

    expect(screen.getByText('Delete').closest('button')).not.toHaveAttribute('disabled');

    await userEvent.click(screen.getByText('Cancel'));
  });
});

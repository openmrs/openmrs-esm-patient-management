import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { usePagination, useSession } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import type { PatientList } from '../api/types';
import ListsTable from './lists-table.component';

type PaginationData = {
  currentPage: number;
  goTo: (page: number) => void;
  results: unknown[];
  totalPages: number;
  paginated: boolean;
  showNextButton: boolean;
  showPreviousButton: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
};

const mockedUseSession = jest.mocked(useSession);
const mockedUsePagination = jest.mocked(usePagination);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(() => ({
    patientListsToShow: 10,
  })),
  usePagination: jest.fn().mockImplementation(() => ({
    currentPage: 1,
    goTo: () => {},
    results: [],
    paginated: true,
  })),
  isDesktop: jest.fn(() => true),
}));

const tableHeaders = [
  { header: 'List name', key: '1' },
  { header: 'List type', key: '2' },
  { header: 'No. of patients', key: '3' },
  { header: 'Starred', key: '4' },
];

const patientLists: Array<PatientList> = [
  {
    id: '3279e187-2d16-4222-a522-54fa9112d567',
    display: 'COBALT Cohort',
    description:
      "Children's Obstructive Lung Disease, Bronchiectasis and Antibiotic Tolerance Study (investigates novel antibiotic treatment for persistent childhood lung infections)",
    type: 'My List',
    size: 200,
  },
  {
    id: 'f1b2ca00-6742-490d-9062-5025644c7632',
    display: 'GENESIS Cohort',
    description:
      'Genomic Evaluation of Neonatal Early Sepsis in Infants - Stratified for Risk Factors (examines genetic factors influencing sepsis risk in newborns).',
    type: 'My List',
    size: 300,
  },
  {
    id: '9c5e8677-6747-4315-84c7-a20f30d795e2',
    display: 'VIGOR Cohort',
    description:
      'Vascular Imaging and Genomics of Onset and Recovery in Stroke (analyzes cardiovascular and genetic markers predictive of stroke outcomes)',
    type: 'My List',
    size: 500,
  },
  {
    id: 'be10d553-b183-4647-9be6-160d1246de8a',
    display: 'EQUITY Cohort',
    description:
      'Equitable Quality in Cancer Treatment for Underserved Young Adults (assesses healthcare disparities in cancer treatment for young adults from disadvantaged backgrounds)',
    type: 'My List',
    size: 100,
  },
  {
    id: '72a84c22-2425-4501-95b7-820b793602f3',
    display: 'MINDSCAPE Cohort',
    description:
      'Mental Illness and Neuroimaging Study for Personalized Assessment and Care Evaluation (develops personalized treatment plans for mental illness based on brain imaging and individual factors)',
    type: 'My List',
    size: 250,
  },
  {
    id: '06ca3df6-92d6-4401-8f06-4f094b004425',
    display: 'MEND Cohort',
    description:
      'Mediterranean Diet, Exercise, and Nutrition for Diabetes (evaluates the combined effects of dietary and lifestyle changes on diabetes management).',
    type: 'My List',
    size: 150,
  },
];

describe('ListsTable', () => {
  beforeEach(() => mockedUseSession.mockReturnValue(mockSession.data));

  it('renders a loading state when patient list data is getting fetched', () => {
    render(<ListsTable error={null} headers={tableHeaders} isLoading listType={'My lists'} patientLists={[]} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders an error state when there is a problem loading patient list data', () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    } as unknown as Error;

    render(
      <ListsTable
        error={error}
        headers={tableHeaders}
        isLoading={false}
        listType={''}
        patientLists={[]}
        refetch={jest.fn()}
      />,
    );

    expect(screen.getByText(/401:\s*unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/sorry, there was a problem displaying this information/i)).toBeInTheDocument();
  });

  it('renders an empty state when there is no patient list data to display', () => {
    render(<ListsTable patientLists={[]} listType={''} />);

    expect(screen.getByTitle(/empty state illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no patient lists to display/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the available patient lists in a datatable', () => {
    const pageSize = 5;

    mockedUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: patientLists.slice(0, pageSize),
          paginated: true,
        }) as unknown as PaginationData,
    );

    render(<ListsTable patientLists={patientLists} listType={''} headers={tableHeaders} isLoading={false} />);

    const columnHeaders = [/List name/, /List type/, /No. of patients/, /Starred/];

    columnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();

    patientLists.slice(0, pageSize).forEach((list) => {
      expect(
        screen.getByRole('row', { name: `${list.display} ${list.type} ${list.size} Star list` }),
      ).toBeInTheDocument();
    });
  });

  it('searches for patient lists by the list name or type', async () => {
    const user = userEvent.setup();
    const pageSize = 5;

    mockedUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: patientLists.slice(0, pageSize),
          paginated: true,
        }) as unknown as PaginationData,
    );

    render(<ListsTable patientLists={patientLists} listType={''} headers={tableHeaders} isLoading={false} />);

    patientLists.slice(0, pageSize).forEach((list) => {
      expect(
        screen.getByRole('row', { name: `${list.display} ${list.type} ${list.size} Star list` }),
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();

    // Search for an existing list
    await user.type(searchInput, 'cobalt');

    expect(screen.getByRole('row', { name: /cobalt cohort my list 200 star list/i })).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBe(2);

    // Search for a list that is not in the first page of results
    await user.clear(searchInput);
    await user.type(searchInput, 'mend');

    expect(screen.getByRole('row', { name: /mend cohort my list 150 star list/i })).toBeInTheDocument();

    // Search for a list that does not exist
    await user.clear(searchInput);
    await user.type(searchInput, 'apollo-soyuz');
    expect(screen.getByText(/no matching lists to display/i)).toBeInTheDocument();
    expect(screen.getByText(/check the filters above/i)).toBeInTheDocument();
  });

  it('clicking the "Star list" button toggles the starred status of a patient list', async () => {
    const user = userEvent.setup();
    const pageSize = 5;

    mockedUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: patientLists.slice(0, pageSize),
          paginated: true,
        }) as unknown as PaginationData,
    );

    render(<ListsTable patientLists={patientLists} listType={''} headers={tableHeaders} isLoading={false} />);

    const cobaltCohortRow = screen.getByRole('row', { name: /cobalt cohort my list 200/i });
    const starListButton = within(cobaltCohortRow).queryByRole('button', { name: /^star list$/i });
    const unstarListButton = within(cobaltCohortRow).queryByRole('button', { name: /^unstar list$/i });

    expect(unstarListButton).not.toBeInTheDocument();
    expect(starListButton).toBeInTheDocument();

    await user.click(starListButton);
    await screen.findByRole('button', { name: /^unstar list$/i });
  });
});

import React from 'react';
import ResultCard from './result-card.component';
import { screen, render } from '@testing-library/react';
import { useVisit, navigate } from '@openmrs/esm-framework';
import userEvent from '@testing-library/user-event';

const mockUseVisit = useVisit as jest.Mock;
const mockOnSearchResultClick = jest.fn();
const mockCloseSearchResultPanel = jest.fn();

const mockPatient = {
  id: 'ae6c955b-f3b6-47e6-b036-59f2055c2002',
  name: [{ given: ['Test', '2.13.2'], family: 'Test' }],
  gender: 'F',
  birthDate: '1995-01-01T00:00:00.000+0300',
  deceasedDateTime: null,
  identifier: [{ value: '287442321-9' }],
  address: [{ city: 'Small Town', country: 'USA', postalCode: '3002', state: 'New york', use: 'home' }],
  telecom: [],
};

const mockVisit = {
  uuid: 'b80b8fba-ab62-11ec-b909-0242ac120002',
  patient: {
    uuid: 'b80b8b8c-ab62-11ec-b909-0242ac120002',
    display: '113RGH - Test Test Test',
  },
  visitType: {
    uuid: 'e7786ac0-ab62-11ec-b909-0242ac120002',
    display: 'Facility Visit',
  },
  location: {
    uuid: 'e7786d9a-ab62-11ec-b909-0242ac120002',
    display: 'Location Test',
  },
  startDatetime: '2022-03-23T10:29:00.000+0000',
  stopDatetime: '2022-03-24T10:29:00.000+0000',
  encounters: [],
};

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    age: jest.fn(() => 24),
    ExtensionSlot: jest.fn((ext) => <div>{ext.extensionSlotName}</div>),
    useVisit: jest.fn(),
  };
});

describe('ResultCard', () => {
  test('Clicking the action button, should not navigate user away from the patient-search', () => {
    mockUseVisit.mockReturnValue({ currentVisit: null });
    render(
      <ResultCard
        patient={mockPatient}
        onSearchResultClick={mockOnSearchResultClick}
        closeSearchResultsPanel={mockCloseSearchResultPanel}
      />,
    );

    const actionButton = screen.getByRole('button', { name: /Actions/i });
    expect(actionButton).toBeInTheDocument();

    userEvent.click(actionButton);

    expect(screen.getByText('patient-actions-slot')).toBeInTheDocument();
    expect(mockOnSearchResultClick).not.toHaveBeenCalled();
  });

  test('should render the result card correctly', () => {
    mockUseVisit.mockReturnValue({ currentVisit: mockVisit });
    render(
      <ResultCard
        patient={mockPatient}
        onSearchResultClick={mockOnSearchResultClick}
        closeSearchResultsPanel={mockCloseSearchResultPanel}
      />,
    );
    expect(screen.getByText(/Test 2.13.2/)).toBeInTheDocument();
    expect(screen.getByText(/Female/i)).toBeInTheDocument();
    expect(screen.getByText(/31 — Dec — 1994/i)).toBeInTheDocument();
    expect(screen.getByText(/24/i)).toBeInTheDocument();

    // extension slots should be in the dom
    expect(screen.getByText(/patient-photo-slot/i)).toBeInTheDocument();
    expect(screen.getByText(/patient-banner-tags-slot/i)).toBeInTheDocument();

    const showMoreDetailsButton = screen.getByRole('button', { name: /Show all details/i });
    expect(showMoreDetailsButton).toBeInTheDocument();

    userEvent.click(showMoreDetailsButton);

    // show more details
    expect(screen.getByText(/Address/)).toBeInTheDocument();
    expect(screen.getByText(/Small Town/i)).toBeInTheDocument();
    expect(screen.getByText(/New york/)).toBeInTheDocument();
    expect(screen.getByText(/3002/)).toBeInTheDocument();
    expect(screen.getByText(/USA/)).toBeInTheDocument();

    const showLessButton = screen.getByRole('button', { name: /Show less/i });
    expect(showLessButton).toBeInTheDocument();

    userEvent.click(showLessButton);

    expect(showMoreDetailsButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Show less/i })).not.toBeInTheDocument();
  });

  test('should navigate a away when user click on the card', () => {
    mockUseVisit.mockReturnValue({ currentVisit: mockVisit });
    render(
      <ResultCard
        patient={mockPatient}
        onSearchResultClick={mockOnSearchResultClick}
        closeSearchResultsPanel={mockCloseSearchResultPanel}
      />,
    );

    const cardItem = screen.getByText(/Test 2.13.2/);
    userEvent.click(cardItem);

    expect(mockOnSearchResultClick).toHaveBeenCalled();
    expect(mockOnSearchResultClick).toHaveBeenCalledWith(mockPatient.id);
  });

  test('should navigate to patient-chart, when user clicks start-visit button', () => {
    mockUseVisit.mockReturnValue({ currentVisit: null });
    render(
      <ResultCard
        patient={mockPatient}
        onSearchResultClick={mockOnSearchResultClick}
        closeSearchResultsPanel={mockCloseSearchResultPanel}
      />,
    );

    const startVisitButton = screen.getByRole('button', { name: /Start visit/i });

    userEvent.click(startVisitButton);

    expect(navigate).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith({
      to: `\${openmrsSpaBase}/patient/${mockPatient.id}/chart`,
    });
  });
});

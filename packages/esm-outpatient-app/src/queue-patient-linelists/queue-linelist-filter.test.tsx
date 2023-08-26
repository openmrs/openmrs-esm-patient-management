import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QueueLinelistFilter from './queue-linelist-filter.component';
import { mockVisitTypes } from '../../__mocks__/visits.mock';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useLayoutType: jest.fn(() => 'tablet'),
  useVisitTypes: jest.fn(() => mockVisitTypes),
  toOpemrsIsoString: jest.fn(),
}));
// Additional mock functions if needed

describe('QueueLinelistFilter', () => {
  it('renders the form with filter elements', () => {
    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Between')).toBeInTheDocument();
    expect(screen.getByLabelText('And')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByText("Use today's date")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select visit type/i })).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Apply filters')).toBeInTheDocument();
  });

  it('calls closePanel function when cancel button is clicked', () => {
    const closePanelMock = jest.fn();
    render(<QueueLinelistFilter closePanel={closePanelMock} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(closePanelMock).toHaveBeenCalledTimes(1);
  });

  it('updates gender state when a radio button is selected', () => {
    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    const maleRadioButton = screen.getByLabelText('Male');
    fireEvent.click(maleRadioButton);

    expect(maleRadioButton).toBeChecked();
  });

  it('updates startAge state when a number is entered', () => {
    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    const startAgeInput = screen.getByLabelText('Between');
    fireEvent.change(startAgeInput, { target: { value: '10' } });

    expect(startAgeInput).toHaveValue(10);
  });

  it('updates returnDate state when date input changes', () => {
    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    const returnDateInput = screen.getByLabelText('Date');
    fireEvent.change(returnDateInput, { target: { value: '2023-08-20' } });

    expect(returnDateInput).toHaveValue('2023-08-20');
  });

  it('should open the visit type dropdown and close after selection', () => {
    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    const visitTypeDropdown = screen.getByRole('button', { name: /Select visit type/i });
    fireEvent.click(visitTypeDropdown);
    const type1Option = screen.getByText('Outpatient Visit');
    fireEvent.click(type1Option);

    expect(visitTypeDropdown).toHaveTextContent('Open menu');
  });
});

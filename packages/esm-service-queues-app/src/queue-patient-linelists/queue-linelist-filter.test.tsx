import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { mockVisitTypes } from '__mocks__';
import QueueLinelistFilter from './queue-linelist-filter.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useLayoutType: jest.fn(() => 'tablet'),
  useVisitTypes: jest.fn(() => mockVisitTypes),
  toOpemrsIsoString: jest.fn(),
}));

describe('QueueLinelistFilter', () => {
  it('renders the form with filter elements', () => {
    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    expect(screen.getByText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Between')).toBeInTheDocument();
    expect(screen.getByLabelText('And')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByText("Use today's date")).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Select visit type/i })).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Apply filters')).toBeInTheDocument();
  });

  it('calls closePanel function when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const closePanelMock = jest.fn();

    render(<QueueLinelistFilter closePanel={closePanelMock} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(closePanelMock).toHaveBeenCalledTimes(1);
  });

  it('updates gender state when a radio button is selected', async () => {
    const user = userEvent.setup();

    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    const maleRadioButton = screen.getByLabelText('Male');
    await user.click(maleRadioButton);

    expect(maleRadioButton).toBeChecked();
  });

  it('updates startAge state when a number is entered', async () => {
    const user = userEvent.setup();
    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    const startAgeInput = screen.getByLabelText('Between');
    await user.type(startAgeInput, '10');

    expect(startAgeInput).toHaveValue(10);
  });

  it('updates returnDate state when date input changes', async () => {
    const user = userEvent.setup();

    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    const returnDateInput = screen.getByLabelText('Date');

    await user.clear(returnDateInput);
    await user.type(returnDateInput, '2023-08-20');

    expect(returnDateInput).toHaveValue('2023-08-20');
  });

  it('should open the visit type dropdown and close after selection', async () => {
    const user = userEvent.setup();

    render(<QueueLinelistFilter closePanel={jest.fn()} />);

    const visitTypeDropdown = screen.getByRole('combobox', { name: /Select visit type/i });
    await user.click(visitTypeDropdown);

    const type1Option = screen.getByText('Outpatient Visit');
    await user.click(type1Option);

    expect(visitTypeDropdown).toHaveTextContent('Open menu');
  });
});

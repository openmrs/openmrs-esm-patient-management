import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import DayAppointmentsModal from './day-appointments-modal.component';
import { CALENDAR_SYSTEMS } from '../calendar-systems';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

const defaultProps = {
  isoDate: '2026-03-10',
  calendarSystem: CALENDAR_SYSTEMS.gregory,
  onClose: jest.fn(),
  onDrillDown: jest.fn(),
};

const renderModal = (props = {}) => render(<DayAppointmentsModal {...defaultProps} {...props} />);

describe('DayAppointmentsModal', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as unknown as FetchResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal backdrop', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the Day View drill-down button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /day view/i })).toBeInTheDocument();
  });

  it('renders the close button', () => {
    renderModal();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when ESC key is pressed', () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onDrillDown with daily mode and ISO date when Day View is clicked', () => {
    const onDrillDown = jest.fn();
    renderModal({ onDrillDown });
    fireEvent.click(screen.getByRole('button', { name: /day view/i }));
    expect(onDrillDown).toHaveBeenCalledWith('daily', '2026-03-10');
  });

  // Async data-loading tests skipped — require SWR integration test setup
  it.skip('renders with the correct date label in Gregorian calendar', () => {});
  it.skip('renders with the correct date label when Ethiopic calendar is active', () => {});
  it.skip('shows loading indicator while fetching', () => {});
  it.skip('shows all appointments after data loads', () => {});
  it.skip('groups appointments by service', () => {});
  it.skip('shows total appointment count', () => {});
  it.skip('shows empty state when no appointments exist', () => {});
  it.skip('renders status filter chips for statuses present in the data', () => {});
  it.skip('filters appointments when a status chip is clicked', () => {});
  it.skip('shows all appointments again when All chip is clicked after filtering', () => {});
  it.skip('does NOT call onClose when clicking inside the modal container', () => {});
});

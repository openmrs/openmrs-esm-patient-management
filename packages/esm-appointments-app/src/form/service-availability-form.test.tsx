import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, openmrsFetch, useLayoutType } from '@openmrs/esm-framework';
import { mockUseAppointmentServiceData } from '__mocks__';
import { renderWithSwr } from 'tools';
import { updateAppointmentService } from '../hooks/useAppointmentsCalendar';
import AppointmentServiceForm from './service-availability-form';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockUpdateAppointmentService = jest.mocked(updateAppointmentService);
const mockUseLayoutType = jest.mocked(useLayoutType);

jest.mock('../hooks/useAppointmentsCalendar', () => ({
  ...jest.requireActual('../hooks/useAppointmentsCalendar'),
  updateAppointmentService: jest.fn(),
}));

const defaultProps = {
  closeWorkspace: jest.fn(),
};

describe('AppointmentServiceForm', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockOpenmrsFetch.mockResolvedValue({ data: mockUseAppointmentServiceData } as unknown as FetchResponse);
  });

  it('renders the service availability form with all fields', async () => {
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    expect(await screen.findByLabelText(/select a service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/max appointments limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/enable weekly availability/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
  });

  it('loads and displays available services in the dropdown', async () => {
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    const serviceSelect = await screen.findByLabelText(/select a service/i);
    expect(serviceSelect).toBeInTheDocument();

    expect(screen.getByRole('option', { name: /select service/i })).toBeInTheDocument();
  });

  it('shows weekly availability options when toggle is enabled', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    const weeklyToggle = await screen.findByLabelText(/enable weekly availability/i);
    expect(weeklyToggle).toBeInTheDocument();

    await user.click(weeklyToggle);

    expect(await screen.findByLabelText(/monday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tuesday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wednesday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/thursday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/friday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/saturday/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sunday/i)).toBeInTheDocument();
  });

  it('shows time and limit fields when a day is selected', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    const weeklyToggle = await screen.findByLabelText(/enable weekly availability/i);
    await user.click(weeklyToggle);

    const mondayCheckbox = screen.getByLabelText(/monday/i);
    await user.click(mondayCheckbox);

    expect(await screen.findByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    const maxAppointmentsInputs = screen.getAllByLabelText(/max appointments/i);
    expect(maxAppointmentsInputs.length).toBeGreaterThan(0);
  });

  it('removes day fields when day is unchecked', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    const weeklyToggle = await screen.findByLabelText(/enable weekly availability/i);
    await user.click(weeklyToggle);

    const mondayCheckbox = screen.getByLabelText(/monday/i);
    await user.click(mondayCheckbox);

    expect(await screen.findByLabelText(/start time/i)).toBeInTheDocument();

    await user.click(mondayCheckbox);

    await waitFor(() => {
      expect(screen.queryByLabelText(/start time/i)).not.toBeInTheDocument();
    });
  });

  it('clears weekly availability data when weekly toggle is disabled', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    const weeklyToggle = await screen.findByLabelText(/enable weekly availability/i);
    await user.click(weeklyToggle);

    const mondayCheckbox = screen.getByLabelText(/monday/i);
    await user.click(mondayCheckbox);

    await waitFor(() => {
      expect(screen.getByLabelText(/monday/i)).toBeChecked();
    });

    await user.click(weeklyToggle);

    await user.click(weeklyToggle);

    await waitFor(() => {
      expect(screen.getByLabelText(/monday/i)).not.toBeChecked();
    });
  });

  it('calls closeWorkspace when discard button is clicked', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    await screen.findByLabelText(/enable weekly availability/i);

    const discardButton = screen.getByRole('button', { name: /discard/i });
    await user.click(discardButton);

    expect(defaultProps.closeWorkspace).toHaveBeenCalled();
  });

  it('submits form successfully with basic service configuration', async () => {
    const user = userEvent.setup();
    mockUpdateAppointmentService.mockResolvedValue({
      success: true,
      data: { uuid: 'test-uuid' },
      error: null,
    });

    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    await screen.findByLabelText(/enable weekly availability/i);

    const serviceSelect = screen.getByLabelText(/select a service/i);
    await user.selectOptions(serviceSelect, ['Outpatient']);

    const maxLimitInput = screen.getByLabelText(/max appointments limit/i);
    await user.clear(maxLimitInput);
    await user.type(maxLimitInput, '10');

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateAppointmentService).toHaveBeenCalled();
    });
  });

  it('submits form successfully with weekly availability configuration', async () => {
    const user = userEvent.setup();
    mockUpdateAppointmentService.mockResolvedValue({
      success: true,
      data: { uuid: 'test-uuid' },
      error: null,
    });

    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    await screen.findByLabelText(/enable weekly availability/i);

    const serviceSelect = screen.getByLabelText(/select a service/i);
    await user.selectOptions(serviceSelect, ['Outpatient']);

    const weeklyToggle = screen.getByLabelText(/enable weekly availability/i);
    await user.click(weeklyToggle);

    const mondayCheckbox = screen.getByLabelText(/monday/i);
    const wednesdayCheckbox = screen.getByLabelText(/wednesday/i);
    await user.click(mondayCheckbox);
    await user.click(wednesdayCheckbox);

    await waitFor(() => {
      const startTimeInputs = screen.getAllByLabelText(/start time/i);
      expect(startTimeInputs.length).toBeGreaterThan(0);
    });

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateAppointmentService).toHaveBeenCalled();
    });
  });

  it('handles update service error gracefully', async () => {
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockUpdateAppointmentService.mockResolvedValue({
      success: false,
      data: null,
      error: { status: 500, message: 'Failed to update service', code: 'INTERNAL_ERROR' },
    });

    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    await screen.findByLabelText(/enable weekly availability/i);

    const serviceSelect = screen.getByLabelText(/select a service/i);
    await user.selectOptions(serviceSelect, ['Outpatient']);

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateAppointmentService).toHaveBeenCalled();
    });
    expect(alertSpy).toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('shows validation error when submitting without selecting a service', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    await screen.findByLabelText(/enable weekly availability/i);

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/service is required/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    mockUpdateAppointmentService.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: {}, error: null }), 1000)),
    );

    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    await screen.findByLabelText(/enable weekly availability/i);

    const serviceSelect = screen.getByLabelText(/select a service/i);
    await user.selectOptions(serviceSelect, ['Outpatient']);

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('supports multiple days selection in weekly availability', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    const weeklyToggle = await screen.findByLabelText(/enable weekly availability/i);
    await user.click(weeklyToggle);

    const mondayCheckbox = screen.getByLabelText(/monday/i);
    const wednesdayCheckbox = screen.getByLabelText(/wednesday/i);
    const fridayCheckbox = screen.getByLabelText(/friday/i);

    await user.click(mondayCheckbox);
    await user.click(wednesdayCheckbox);
    await user.click(fridayCheckbox);

    await waitFor(() => {
      expect(mondayCheckbox).toBeChecked();
    });
    expect(wednesdayCheckbox).toBeChecked();
    expect(fridayCheckbox).toBeChecked();

    const startTimeInputs = screen.getAllByLabelText(/start time/i);
    expect(startTimeInputs).toHaveLength(3);
  });

  it('allows empty max appointments limit for unlimited appointments', async () => {
    const user = userEvent.setup();
    mockUpdateAppointmentService.mockResolvedValue({
      success: true,
      data: { uuid: 'test-uuid' },
      error: null,
    });

    renderWithSwr(<AppointmentServiceForm {...defaultProps} />);

    await screen.findByLabelText(/enable weekly availability/i);

    const serviceSelect = screen.getByLabelText(/select a service/i);
    await user.selectOptions(serviceSelect, ['Outpatient']);

    const maxLimitInput = screen.getByLabelText(/max appointments limit/i);
    expect(maxLimitInput).toHaveValue(null);

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateAppointmentService).toHaveBeenCalled();
    });
    const callArgs = mockUpdateAppointmentService.mock.calls[0][1];
    expect(callArgs.maxAppointmentsLimit).toBeNull();
  });
});

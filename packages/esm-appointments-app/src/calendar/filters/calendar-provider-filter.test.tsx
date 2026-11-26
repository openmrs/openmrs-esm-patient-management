import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { mockProviders } from '__mocks__';
import { useProviders } from '../../hooks/useProviders';
import CalendarProviderFilter from './calendar-provider-filter.component';

vi.mock('../../hooks/useProviders', () => ({
  useProviders: vi.fn(),
}));

const mockUseProviders = vi.mocked(useProviders);

const [jamesCook, amstrongNeil] = mockProviders.data;

describe('CalendarProviderFilter', () => {
  beforeEach(() => {
    mockUseProviders.mockReturnValue({
      providers: mockProviders.data,
      isLoading: false,
      error: undefined,
      isValidating: false,
    });
  });

  it('shows "All providers" when nothing is selected', () => {
    render(<CalendarProviderFilter selectedProviderUuids={[]} onChange={vi.fn()} />);

    expect(screen.getByRole('combobox', { name: /^provider$/i })).toBeInTheDocument();
    expect(screen.getByText('All providers')).toBeInTheDocument();
  });

  it('lists every provider by display name when opened', async () => {
    const user = userEvent.setup();
    render(<CalendarProviderFilter selectedProviderUuids={[]} onChange={vi.fn()} />);

    await user.click(screen.getByRole('combobox', { name: /^provider$/i }));

    expect(screen.getByRole('option', { name: /doctor - James Cook/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /doctor - Amstrong Neil/i })).toBeInTheDocument();
  });

  it('calls onChange with the selected provider uuids', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CalendarProviderFilter selectedProviderUuids={[]} onChange={onChange} />);

    await user.click(screen.getByRole('combobox', { name: /^provider$/i }));
    await user.click(screen.getByRole('option', { name: /doctor - James Cook/i }));

    expect(onChange).toHaveBeenLastCalledWith([jamesCook.uuid]);
  });

  it('shows the number of selected providers in the trigger label', () => {
    render(<CalendarProviderFilter selectedProviderUuids={[jamesCook.uuid, amstrongNeil.uuid]} onChange={vi.fn()} />);

    expect(screen.getByText('2 provider(s)')).toBeInTheDocument();
    expect(screen.queryByText('All providers')).not.toBeInTheDocument();
  });

  it('calls onChange with an empty list when the selection is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CalendarProviderFilter selectedProviderUuids={[jamesCook.uuid]} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /clear all selected items/i }));

    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServiceFilter from './service-filter.component';

describe('ServiceFilter', () => {
  const mockServices = [
    { uuid: 'service-1', name: 'General Medicine' },
    { uuid: 'service-2', name: 'HIV Clinic' },
    { uuid: 'service-3', name: 'Dental' },
  ];

  const mockColorMap = new Map<string, string>([
    ['service-1', '#ff0000'],
    ['service-2', '#00ff00'],
  ]);

  it('renders MultiSelect with placeholder text and services', () => {
    render(
      <ServiceFilter
        services={mockServices}
        serviceColorMap={mockColorMap}
        selectedServiceUuids={[]}
        onServiceChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('combobox', { name: /service/i })).toBeInTheDocument();
    expect(screen.getByText('All services')).toBeInTheDocument();
  });

  it('calls onServiceChange with selected UUIDs when an option is chosen', async () => {
    const user = userEvent.setup();
    const handleServiceChange = vi.fn();

    render(
      <ServiceFilter
        services={mockServices}
        serviceColorMap={mockColorMap}
        selectedServiceUuids={[]}
        onServiceChange={handleServiceChange}
      />,
    );

    const combobox = screen.getByRole('combobox', { name: /service/i });
    await user.click(combobox);

    const option = await screen.findByRole('option', { name: /general medicine/i });
    await user.click(option);

    expect(handleServiceChange).toHaveBeenCalledWith(['service-1']);
  });
});

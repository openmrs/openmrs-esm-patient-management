import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import RefineSearch from './refine-search.component';
import { type PatientSearchConfig } from '../../config-schema';
import { usePersonAttributeType } from './person-attributes.resource';

const mockUseConfig = jest.mocked(useConfig);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUsePersonAttributeType = jest.mocked(usePersonAttributeType);

jest.mock('./person-attributes.resource', () => ({
  usePersonAttributeType: jest.fn(),
}));

describe('RefineSearch', () => {
  const user = userEvent.setup();

  const mockSetFilters = jest.fn();
  const mockConfig = {
    search: {
      searchFilterFields: {
        gender: {
          enabled: true,
        },
        dateOfBirth: {
          enabled: true,
        },
        age: {
          enabled: true,
          min: 0,
        },
        postcode: {
          enabled: true,
        },
        personAttributes: [
          {
            attributeTypeUuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
          },
        ],
      },
    },
  } as PatientSearchConfig;

  beforeEach(() => {
    mockUseConfig.mockReturnValue(mockConfig);
    mockUseLayoutType.mockReturnValue('tablet');
    mockUsePersonAttributeType.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        format: 'java.lang.String',
        uuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
        display: 'Telephone Number',
      },
    });
  });

  const renderComponent = (props = {}) => {
    return render(<RefineSearch setFilters={mockSetFilters} inTabletOrOverlay={false} filtersApplied={0} {...props} />);
  };

  it('renders all enabled search fields', () => {
    renderComponent();

    expect(screen.getByText('Sex')).toBeInTheDocument();
    expect(screen.getByText('Day of Birth')).toBeInTheDocument();
    expect(screen.getByText('Month of Birth')).toBeInTheDocument();
    expect(screen.getByText('Year of Birth')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.getByLabelText('Postcode')).toBeInTheDocument();
  });

  it('shows number of filters applied in Apply button when filters are active', () => {
    renderComponent({ filtersApplied: 2 });

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).toHaveTextContent('Apply (2 filters applied)');
  });

  it('calls setFilters with initial state when Reset Fields is clicked', async () => {
    renderComponent();

    await user.click(screen.getByRole('button', { name: /reset fields/i }));

    expect(mockSetFilters).toHaveBeenCalledWith({
      gender: 'any',
      dateOfBirth: 0,
      monthOfBirth: 0,
      yearOfBirth: 0,
      postcode: '',
      age: 0,
      attributes: {},
    });
  });

  it('submits form with current state when Apply is clicked', async () => {
    renderComponent();

    const ageInput = screen.getByRole('spinbutton', { name: /age/i });
    await user.type(ageInput, '30');
    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: 'any',
        dateOfBirth: 0,
        monthOfBirth: 0,
        yearOfBirth: 0,
        postcode: '',
        attributes: {},
        age: 30,
      }),
    );
  });

  describe('Layout rendering', () => {
    it('renders desktop layout by default', () => {
      renderComponent();

      expect(screen.getByRole('refine-search')).toHaveClass('refineSearchContainer');
      expect(screen.queryByRole('button', { name: /refine search/i })).not.toBeInTheDocument();
    });

    it('renders tablet layout when inTabletOrOverlay is true', () => {
      mockUseLayoutType.mockReturnValue('tablet');
      renderComponent({ inTabletOrOverlay: true });

      expect(screen.queryByRole('form')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refine search/i })).toBeInTheDocument();
    });

    it('updates filter count in tablet mode', async () => {
      mockUseLayoutType.mockReturnValue('tablet');
      renderComponent({ inTabletOrOverlay: true, filtersApplied: 2 });

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/search queries added/i)).toBeInTheDocument();
    });
  });

  describe('Input handling', () => {
    it('handles gender selection correctly', async () => {
      renderComponent();

      await user.click(screen.getByRole('tab', { name: 'Male' }));
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          gender: 'male',
        }),
      );
    });

    it('handles date of birth inputs correctly', async () => {
      renderComponent();

      const dayInput = screen.getByRole('spinbutton', { name: /day of birth/i });
      const monthInput = screen.getByRole('spinbutton', { name: /month of birth/i });
      const yearInput = screen.getByRole('spinbutton', { name: /year of birth/i });

      await user.type(dayInput, '15');
      await user.type(monthInput, '03');
      await user.type(yearInput, '1990');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          dateOfBirth: 15,
          monthOfBirth: 3,
          yearOfBirth: 1990,
        }),
      );
    });

    it('validates date of birth inputs', async () => {
      renderComponent();

      const dayInput = screen.getByRole('spinbutton', { name: /day of birth/i });
      const monthInput = screen.getByRole('spinbutton', { name: /month of birth/i });

      await user.type(dayInput, '32');
      expect(dayInput).toHaveAttribute('max', '31');

      await user.type(monthInput, '13');
      expect(monthInput).toHaveAttribute('max', '12');
    });
  });
});

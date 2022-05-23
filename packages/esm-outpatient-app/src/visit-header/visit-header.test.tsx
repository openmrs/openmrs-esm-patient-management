import React from 'react';
import VisitHeader from './visit-header.component';
import { render, screen } from '@testing-library/react';
import { mockPatient, mockPatientWithLongName } from '../../__mocks__/patient.mock';
import { useAssignedExtensions, useLayoutType, useOnClickOutside, usePatient, useVisit } from '@openmrs/esm-framework';
import userEvent from '@testing-library/user-event';
import { registerWorkspace, launchPatientWorkspace } from './workspaces';

const mockUseAssignedExtensions = useAssignedExtensions as jest.Mock;
const mockUsePatient = usePatient as jest.Mock;
const mockUseVisit = useVisit as jest.Mock;
const mockUseLayoutType = useLayoutType as jest.Mock;
const mockExtensionRegistry = {};

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    usePatient: jest.fn(),
    useAssignedExtensions: jest.fn(),
    age: jest.fn(() => 20),
    LeftNavMenu: jest.fn().mockImplementation(() => <div>Left Nav Menu</div>),
    useVisit: jest.fn(),
    registerExtension: (ext) => {
      mockExtensionRegistry[ext.name] = ext;
    },
    getExtensionRegistration: (name) => mockExtensionRegistry[name],
    translateFrom: (module, key, defaultValue, options) => defaultValue,
    useOnClickOutside: jest.fn(),
  };
});

jest.mock('./workspaces', () => {
  const originalModule = jest.requireActual('./workspaces');
  return {
    ...originalModule,
    launchPatientWorkspace: jest.fn(),
  };
});

describe('VisitHeader', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should display visit header and left nav bar hamburger icon', () => {
    registerWorkspace({ name: 'start-visit-workspace-form', title: 'Start visit', load: jest.fn() });
    mockUseAssignedExtensions.mockReturnValue([{ id: 'someId' }]);
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      isLoading: false,
      error: null,
      patientUuid: mockPatient.id,
    });
    mockUseVisit.mockReturnValue({ isValidating: null, currentVisit: null });
    mockUseLayoutType.mockReturnValue('tablet');
    render(<VisitHeader />);

    const headerBanner = screen.getByRole('banner', { name: /OpenMRS/i });
    expect(headerBanner).toBeInTheDocument();
    expect(screen.getByText(/John Wilson/i)).toBeInTheDocument();

    const hamburgerButton = screen.getByRole('button', { name: /Open Menu/i });
    const homeLink = screen.getByRole('link');
    expect(hamburgerButton).toBeInTheDocument();
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/openmrs/spa/home');

    // Should display the leftNavMenu
    userEvent.click(hamburgerButton);
    const linkElement = screen.getByText(/Left Nav Menu/i);
    expect(linkElement).toBeInTheDocument();

    // Should close the leftNavMenu
    userEvent.click(linkElement);
    expect(useOnClickOutside).toHaveBeenCalled();

    // Should be able to start a visit
    const startVisitButton = screen.getByRole('button', { name: /Start a visit/i });
    expect(startVisitButton).toBeInTheDocument();

    userEvent.click(startVisitButton);
    expect(launchPatientWorkspace).toHaveBeenCalled();
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();

    // Should close the visit-header
    userEvent.click(closeButton);
    expect(screen.queryByRole('banner', { name: /OpenMRS/i })).not.toBeInTheDocument();
  });

  test('should display truncated name, when patient name is very long', () => {
    mockUseAssignedExtensions.mockReturnValue([{ id: 'someId' }]);
    mockUsePatient.mockReturnValue({
      patient: mockPatientWithLongName,
      isLoading: false,
      error: null,
      patientUuid: mockPatient.id,
    });
    mockUseVisit.mockReturnValue({ isValidating: null, currentVisit: null });
    mockUseLayoutType.mockReturnValue('desktop');
    render(<VisitHeader />);

    const longNameText = screen.getByText(/^Some very long given name...$/i);
    expect(longNameText).toBeInTheDocument();
    expect(screen.getByText(/^Some very long given name family name 20, male$/i)).toBeInTheDocument();
  });
});

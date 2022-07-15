import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAssignedExtensions, useLayoutType, useOnClickOutside, usePatient, useVisit } from '@openmrs/esm-framework';
import { mockPatient, mockPatientWithLongName } from '../../../../__mocks__/patient.mock';
import { registerWorkspace, launchPatientWorkspace } from './workspaces';
import VisitHeader from './visit-header.component';

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
  test('should display visit header and left nav bar hamburger icon', async () => {
    const user = userEvent.setup();

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

    renderVisitHeader();

    const headerBanner = screen.getByRole('banner', { name: /OpenMRS/i });
    expect(headerBanner).toBeInTheDocument();
    expect(screen.getByText(/John Wilson/i)).toBeInTheDocument();

    const hamburgerButton = screen.getByRole('button', { name: /Open Menu/i });
    const homeLink = screen.getByRole('link');
    expect(hamburgerButton).toBeInTheDocument();
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/openmrs/spa/home');

    // Should display the leftNavMenu
    await user.click(hamburgerButton);
    const linkElement = screen.getByText(/Left Nav Menu/i);
    expect(linkElement).toBeInTheDocument();

    // Should close the leftNavMenu
    await user.click(linkElement);
    expect(useOnClickOutside).toHaveBeenCalled();

    // Should be able to start a visit
    const startVisitButton = screen.getByRole('button', { name: /Start a visit/i });
    expect(startVisitButton).toBeInTheDocument();

    await user.click(startVisitButton);
    expect(launchPatientWorkspace).toHaveBeenCalled();
    expect(launchPatientWorkspace).toHaveBeenCalledWith('start-visit-workspace-form');

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();

    // Should close the visit-header
    await user.click(closeButton);
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

    renderVisitHeader();

    const longNameText = screen.getByText(/^Some very long given name...$/i);
    expect(longNameText).toBeInTheDocument();
    expect(screen.getByText(/^Some very long given name family name 20, male$/i)).toBeInTheDocument();
  });
});

function renderVisitHeader() {
  render(<VisitHeader />);
}

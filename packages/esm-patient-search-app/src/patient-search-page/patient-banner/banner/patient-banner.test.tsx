import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import PatientBanner from './patient-banner.component';

const testProps = {
  patient: mockPatient,
  patientUuid: mockPatient.id,
};

const mockNavigateTo = jest.fn();

jest.mock('@openmrs/esm-framework', () => ({
  ...(jest.requireActual('@openmrs/esm-framework') as any),
  useVisit: jest.fn(),
  age: jest.fn(),
}));

describe('PatientBanner: ', () => {
  it('renders patient-related information in a banner at the top of the page', () => {
    renderPatientBanner();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveClass('patientAvatar');
    expect(screen.getByText(/John Wilson/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Actions$/i })).toBeInTheDocument();
    expect(screen.getByText(/04 — Apr — 1972/i)).toBeInTheDocument();
    expect(screen.getByText(/100732HE, 100GEJ/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Show all details$/i })).toBeInTheDocument();
  });

  it("can toggle between showing or hiding the patient's contact details", () => {
    renderPatientBanner();

    const showContactDetailsBtn = screen.getByRole('button', {
      name: /^Show all details$/i,
    });

    userEvent.click(showContactDetailsBtn);

    const showLessBtn = screen.getByRole('button', {
      name: /^Show less$/i,
    });
    expect(showLessBtn).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText(/Contact Details/i)).toBeInTheDocument();

    userEvent.click(showLessBtn);

    expect(showContactDetailsBtn).toBeInTheDocument();
  });

  it('should allow navigate to patient-chart on patient-search', () => {
    const patientBannerSeachPageProps = { ...testProps, onClick: mockNavigateTo };
    render(<PatientBanner {...patientBannerSeachPageProps} />);

    const imgAvatar = screen.getByRole('img');
    userEvent.click(imgAvatar);

    expect(mockNavigateTo).toHaveBeenCalled();
    expect(mockNavigateTo).toHaveBeenCalledWith(patientBannerSeachPageProps.patientUuid);

    const showContactDetailsBtn = screen.getByRole('button', {
      name: /^Show all details$/i,
    });
    userEvent.click(showContactDetailsBtn);

    expect(mockNavigateTo).toHaveBeenCalledTimes(1);

    const showLessBtn = screen.getByRole('button', {
      name: /^Show less$/i,
    });
    expect(showLessBtn).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText(/Contact Details/i)).toBeInTheDocument();
  });
});

function renderPatientBanner() {
  render(<PatientBanner {...testProps} />);
}

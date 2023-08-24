import React from 'react';
import { render, screen } from '@testing-library/react';
import DisplayPatientPhoto from './display-photo.component';
import { mockPatient } from '../../../../__mocks__/appointments.mock';

jest.mock('../patient-registration/patient-registration.resource', () => ({
  usePatientPhoto: jest.fn().mockReturnValue({ data: { imageSrc: 'test-image-src' } }),
}));

jest.mock('geopattern', () => ({
  generate: jest.fn().mockReturnValue({
    toDataUri: jest.fn().mockReturnValue('https://example.com'),
  }),
}));

const patientUuid = mockPatient.uuid;
const patientName = mockPatient.name;

describe('DisplayPatientPhoto Component', () => {
  it('should render the component with the patient photo and size should not be small', () => {
    render(<DisplayPatientPhoto patientUuid={patientUuid} patientName={patientName} />);

    const avatarImage = screen.getByTitle(`${patientName}`);

    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('style', expect.stringContaining('width: 80px; height: 80px'));
  });

  it('should render the component with the patient photo and size should be small i.e. 48px', () => {
    render(<DisplayPatientPhoto patientUuid={patientUuid} patientName={patientName} size="small" />);

    const avatarImage = screen.getByTitle(`${patientName}`);

    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('style', expect.stringContaining('width: 48px; height: 48px'));
  });
});

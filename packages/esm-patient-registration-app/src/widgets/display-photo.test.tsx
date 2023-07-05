import React from 'react';
import { render, screen } from '@testing-library/react';
import DisplayPatientPhoto from './display-photo.component';

jest.mock('../patient-registration/patient-registration.resource', () => ({
  usePatientPhoto: jest.fn().mockReturnValue({ data: { imageSrc: 'test-image-src' } }),
}));
jest.mock('geopattern', () => ({
  generate: jest.fn().mockReturnValue({
    toDataUri: jest.fn().mockReturnValue('test-pattern-url'),
  }),
}));

describe('DisplayPatientPhoto Component', () => {
  it('should render the component with the patient photo and size should not be small', () => {
    const patientUuid = '12345';
    const patientName = 'John Doe';
    render(<DisplayPatientPhoto patientUuid={patientUuid} patientName={patientName} />);

    const avatarImage = screen.getByTitle(`${patientName}`);

    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('style', expect.stringContaining('width: 80px; height: 80px'));
  });

  it('should render the component with the patient photo and size should be small i.e. 48px', () => {
    const patientUuid = '12345';
    const patientName = 'John Doe';
    render(<DisplayPatientPhoto patientUuid={patientUuid} patientName={patientName} size="small" />);

    const avatarImage = screen.getByTitle(`${patientName}`);

    expect(avatarImage).toBeInTheDocument();
    expect(avatarImage).toHaveAttribute('style', expect.stringContaining('width: 48px; height: 48px'));
  });
});

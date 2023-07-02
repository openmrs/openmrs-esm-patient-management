import React from 'react';
import { render } from '@testing-library/react';
import DisplayPatientPhoto from './display-photo.component';

jest.mock('../patient-registration/patient-registration.resource', () => ({
  usePatientPhoto: jest.fn().mockReturnValue({ data: { imageSrc: 'test-image-src' } }),
}));
jest.mock('geopattern', () => ({
  generate: jest.fn().mockReturnValue({
    toDataUri: jest.fn().mockReturnValue('test-pattern-url'),
  }),
}));

describe('DisplayPatientPhoto', () => {
  it('should render the component with the patient photo', () => {
    const patientUuid = '12345';
    const patientName = 'John Doe';
    const { getByTitle, getByTestId } = render(
      <DisplayPatientPhoto patientUuid={patientUuid} patientName={patientName} size="small" />,
    );

    const avatarImage = getByTitle(`${patientName}`);

    expect(avatarImage).toBeInTheDocument();
  });
});

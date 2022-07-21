import React from 'react';
import Avatar from 'react-avatar';
import GeoPattern from 'geopattern';
import { usePatientPhoto } from '../patient-registration/patient-registration.resource';

interface DisplayPatientPhotoProps {
  patientName: string;
  patientUuid: string;
  size?: string;
}

export default function DisplayPatientPhoto({ patientUuid, patientName, size }: DisplayPatientPhotoProps) {
  const { data: photo } = usePatientPhoto(patientUuid);
  const patternUrl: string = GeoPattern.generate(patientUuid).toDataUri();

  return (
    <Avatar
      alt={`${patientName ? `${patientName}'s avatar` : 'Patient avatar'}`}
      color="rgba(0,0,0,0)"
      name={patientName}
      src={photo?.imageSrc}
      size={size === 'small' ? '48' : '80'}
      textSizeRatio={size === 'small' ? 1 : 2}
      style={{
        backgroundImage: `url(${patternUrl})`,
        backgroundRepeat: 'round',
      }}
    />
  );
}

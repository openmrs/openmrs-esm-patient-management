import React from 'react';
import Avatar from 'react-avatar';
import GeoPattern from 'geopattern';
import { usePatientPhoto } from '../patient-registration/patient-registration.resource';
import styles from './display-photo.scss';

interface DisplayPatientPhotoProps {
  patientName: string;
  patientUuid: string;
}

export default function DisplayPatientPhoto({ patientUuid, patientName }: DisplayPatientPhotoProps) {
  const { data: photo } = usePatientPhoto(patientUuid);
  const patternUrl: string = GeoPattern.generate(patientUuid).toDataUri();

  return (
    <div className={styles.photoFrame}>
      <Avatar
        alt={`${patientName ? `${patientName}'s avatar` : 'Patient avatar'}`}
        color="rgba(0,0,0,0)"
        name={patientName}
        src={photo?.imageSrc}
        size="120"
        style={{ backgroundImage: `url(${patternUrl})`, backgroundRepeat: 'round' }}
      />
    </div>
  );
}

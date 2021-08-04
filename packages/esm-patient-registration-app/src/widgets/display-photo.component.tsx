import React, { useEffect, useState } from 'react';
import placeholder from '../assets/placeholder.svg';
import { useConfig } from '@openmrs/esm-framework';
import { fetchPatientPhotoUrl } from '../patient-registration/patient-registration.resource';
import styles from './display-photo.scss';

export default function DisplayPatientPhoto(props: { patientUuid: string }) {
  const [photo, setPhoto] = useState(placeholder);
  const config = useConfig();

  useEffect(() => {
    const ac = new AbortController();
    if (props.patientUuid) {
      fetchPatientPhotoUrl(props.patientUuid, config.concepts.patientPhotoUuid, ac)
        .then((data) => data && setPhoto(data.imageData))
        .catch((error) => error.code !== 20 && Promise.reject(error));
    }
    return () => ac.abort();
  }, [props.patientUuid, config.concepts.patientPhotoUuid]);

  return (
    <div className={styles.photoFrame}>
      <img src={photo} alt="Patient avatar" />
    </div>
  );
}

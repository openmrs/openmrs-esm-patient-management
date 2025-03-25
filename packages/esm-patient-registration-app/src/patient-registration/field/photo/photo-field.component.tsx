import React, { useCallback } from 'react';
import { usePatientRegistrationContext } from '../../patient-registration-context';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from '../field.scss';

export const PhotoComponent = () => {
  const { setCapturePhotoProps, currentPhoto, setFieldTouched } = usePatientRegistrationContext();

  const onCapturePhoto = useCallback(
    (dataUri: string, photoDateTime: string) => {
      if (setCapturePhotoProps) {
        setCapturePhotoProps({
          imageData: dataUri,
          dateTime: photoDateTime,
        });
        setFieldTouched('photo', true, false);
      }
    },
    [setCapturePhotoProps, setFieldTouched],
  );

  return (
    <ExtensionSlot
      className={styles.photoExtension}
      name="capture-patient-photo-slot"
      state={{ onCapturePhoto, initialState: currentPhoto }}
    />
  );
};

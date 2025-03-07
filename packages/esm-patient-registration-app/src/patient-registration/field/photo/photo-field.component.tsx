import React, { useCallback, useContext } from 'react';
import { PatientRegistrationContext } from '../../patient-registration-context';
import styles from '../field.scss';
import { ExtensionSlot } from '@openmrs/esm-framework';

export const PhotoComponent = () => {
  const { setCapturePhotoProps, currentPhoto, setFieldTouched } = useContext(PatientRegistrationContext);

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

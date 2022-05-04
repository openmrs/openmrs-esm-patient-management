import React, { useCallback, useContext, useEffect } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './../section.scss';
import { useField } from 'formik';
import { SectionProps } from '../section-helper';
import { FieldSections } from '../registration-section.component';
import { PatientRegistrationContext } from '../../patient-registration-context';

export const DemographicsSection: React.FC<SectionProps> = ({ fieldSections }) => {
  const { currentPhoto, setFieldValue, setCapturePhotoProps } = useContext(PatientRegistrationContext);
  const [field, meta] = useField('addNameInLocalLanguage');

  const onCapturePhoto = useCallback(
    (dataUri: string, photoDateTime: string) => {
      if (setCapturePhotoProps) {
        setCapturePhotoProps({
          imageData: dataUri,
          dateTime: photoDateTime,
        });
      }
    },
    [setCapturePhotoProps],
  );

  useEffect(() => {
    if (!field.value && meta.touched) {
      setFieldValue('additionalGivenName', '');
      setFieldValue('additionalMiddleName', '');
      setFieldValue('additionalFamilyName', '');
    }
  }, [field.value, meta.touched, setFieldValue]);

  return (
    <section className={styles.formSection} aria-label="Demographics Section">
      <ExtensionSlot
        className={styles.photoExtension}
        extensionSlotName="capture-patient-photo-slot"
        state={{ onCapturePhoto, initialState: currentPhoto }}
      />
      <FieldSections id="demographics" fieldSections={fieldSections} />
    </section>
  );
};

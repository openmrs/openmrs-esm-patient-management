import React from 'react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { PatientRegistrationContext, useFieldConfig } from '../../patient-registration-context';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';

export const NameField = () => {
  const { t } = useTranslation();
  const { setCapturePhotoProps, currentPhoto } = React.useContext(PatientRegistrationContext);

  const onCapturePhoto = (dataUri: string, selectedFile: File, photoDateTime: string) => {
    if (setCapturePhotoProps) {
      setCapturePhotoProps({
        base64EncodedImage: dataUri,
        imageFile: selectedFile,
        photoDateTime: photoDateTime,
      });
    }
  };

  const fieldConfigs = useFieldConfig('name');
  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('fullNameLabelText', 'Full Name')}</h4>
      <Input id="givenName" name="givenName" labelText={t('givenNameLabelText', 'Given Name')} light />
      <ExtensionSlot
        extensionSlotName="capture-patient-photo-slot"
        state={{ onCapturePhoto, initialState: currentPhoto }}
      />
      {fieldConfigs.displayMiddleName && (
        <Input id="middleName" name="middleName" labelText={t('middleNameLabelText', 'Middle Name')} light />
      )}
      <Input id="familyName" name="familyName" labelText={t('familyNameLabelText', 'Family Name')} light />
    </div>
  );
};

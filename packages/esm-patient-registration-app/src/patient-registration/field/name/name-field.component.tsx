import React, { useCallback, useContext } from 'react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { PatientRegistrationContext, useFieldConfig } from '../../patient-registration-context';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, useLayoutType } from '@openmrs/esm-framework';

const containsNoNumbers = /^([^0-9]*)$/;

function checkNumber(value: string) {
  if (!containsNoNumbers.test(value)) {
    return 'numberInNameDubious';
  }

  return undefined;
}

export const NameField = () => {
  const { t } = useTranslation();
  const { setCapturePhotoProps, currentPhoto } = useContext(PatientRegistrationContext);
  const layout = useLayoutType();
  const desktop = layout === 'desktop';

  const onCapturePhoto = useCallback((dataUri: string, photoDateTime: string) => {
    if (setCapturePhotoProps) {
      setCapturePhotoProps({
        imageData: dataUri,
        dateTime: photoDateTime,
      });
    }
  }, []);

  const fieldConfigs = useFieldConfig('name');

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('fullNameLabelText', 'Full Name')}</h4>
      <div className={styles.grid}>
        <ExtensionSlot
          className={styles.photoExtension}
          extensionSlotName="capture-patient-photo-slot"
          state={{ onCapturePhoto, initialState: currentPhoto }}
        />

        <div className={styles.nameField}>
          <Input
            id="givenName"
            name="givenName"
            labelText={t('givenNameLabelText', 'Given Name')}
            light
            checkWarning={checkNumber}
          />
          {fieldConfigs.displayMiddleName && (
            <Input
              id="middleName"
              name="middleName"
              labelText={t('middleNameLabelText', 'Middle Name')}
              light
              checkWarning={checkNumber}
            />
          )}
          <Input
            id="familyName"
            name="familyName"
            labelText={t('familyNameLabelText', 'Family Name')}
            light
            checkWarning={checkNumber}
          />
        </div>
      </div>
    </div>
  );
};

import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useField } from 'formik';
import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import { Input } from '../../input/basic-input/input/input.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import styles from '../field.scss';
import { RegistrationConfig } from '../../../config-schema';

const containsNoNumbers = /^([^0-9]*)$/;

function checkNumber(value: string) {
  if (!containsNoNumbers.test(value)) {
    return 'numberInNameDubious';
  }

  return undefined;
}

export const NameField = () => {
  const {
    fieldConfigurations: {
      name: { displayCapturePhoto, displayReverseFieldOrder },
    },
  } = useConfig() as RegistrationConfig;
  const { t } = useTranslation();
  const { setCapturePhotoProps, currentPhoto, setFieldValue } = useContext(PatientRegistrationContext);
  const { fieldConfigurations } = useConfig();
  const fieldConfigs = fieldConfigurations?.name;
  const [{ value: unidentified }] = useField('unidentifiedPatient');
  const nameKnown = !unidentified;

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

  const toggleNameKnown = (e) => {
    if (e.name === 'known') {
      setFieldValue('givenName', '');
      setFieldValue('familyName', '');
      setFieldValue('unidentifiedPatient', false);
    } else {
      setFieldValue('givenName', fieldConfigs.defaultUnknownGivenName);
      setFieldValue('familyName', fieldConfigs.defaultUnknownFamilyName);
      setFieldValue('unidentifiedPatient', true);
    }
  };

  const firstNameField = (
    <Input
      id="givenName"
      name="givenName"
      labelText={t('givenNameLabelText', 'First Name')}
      checkWarning={checkNumber}
      required
    />
  );

  const middleNameField = fieldConfigs.displayMiddleName && (
    <Input
      id="middleName"
      name="middleName"
      labelText={t('middleNameLabelText', 'Middle Name')}
      checkWarning={checkNumber}
    />
  );

  const familyNameField = (
    <Input
      id="familyName"
      name="familyName"
      labelText={t('familyNameLabelText', 'Family Name')}
      checkWarning={checkNumber}
      required
    />
  );

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('fullNameLabelText', 'Full Name')}</h4>
      <div className={styles.grid}>
        {displayCapturePhoto && (
          <ExtensionSlot
            className={styles.photoExtension}
            name="capture-patient-photo-slot"
            state={{ onCapturePhoto, initialState: currentPhoto }}
          />
        )}

        <div className={styles.nameField}>
          <div className={styles.dobContentSwitcherLabel}>
            <span className={styles.label01}>{t('patientNameKnown', "Patient's Name is Known?")}</span>
          </div>
          <ContentSwitcher className={styles.contentSwitcher} onChange={toggleNameKnown}>
            <Switch name="known" text={t('yes', 'Yes')} />
            <Switch name="unknown" text={t('no', 'No')} />
          </ContentSwitcher>
          {nameKnown &&
            (!displayReverseFieldOrder ? (
              <>
                {firstNameField}
                {middleNameField}
                {familyNameField}
              </>
            ) : (
              <>
                {familyNameField}
                {middleNameField}
                {firstNameField}
              </>
            ))}
        </div>
      </div>
    </div>
  );
};

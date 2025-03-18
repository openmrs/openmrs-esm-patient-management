import React, { useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useField } from 'formik';
import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../../../config-schema';
import { Input } from '../../input/basic-input/input/input.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import styles from '../field.scss';

export const unidentifiedPatientAttributeTypeUuid = '8b56eac7-5c76-4b9c-8c6f-1deab8d3fc47';
const containsNoNumbers = /^([^0-9]*)$/;

function checkNumber(value: string) {
  if (!containsNoNumbers.test(value)) {
    return 'numberInNameDubious';
  }

  return undefined;
}

export const NameField = () => {
  const { t } = useTranslation();
  const { setCapturePhotoProps, currentPhoto, setFieldValue, setFieldTouched } = useContext(PatientRegistrationContext);
  const {
    fieldConfigurations: {
      name: {
        displayCapturePhoto,
        allowUnidentifiedPatients,
        defaultUnknownGivenName,
        defaultUnknownFamilyName,
        defaultUnknownFamilyName2,
        displayMiddleName,
        displayReverseFieldOrder,
      },
    },
  } = useConfig<RegistrationConfig>();

  const [{ value: isPatientUnknownValue }, , { setValue: setUnknownPatient }] = useField<string>(
    `attributes.${unidentifiedPatientAttributeTypeUuid}`,
  );

  const isPatientUnknown = isPatientUnknownValue === 'true';

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

  const toggleNameKnown = (e) => {
    if (e.name === 'known') {
      setFieldValue('givenName', '');
      setFieldValue('familyName', '');
      setFieldValue('familyName2', '');
      setUnknownPatient('false');
    } else {
      setFieldValue('givenName', defaultUnknownGivenName);
      setFieldValue('familyName', defaultUnknownFamilyName);
      setFieldValue('familyName2', defaultUnknownFamilyName2);
      setUnknownPatient('true');
    }
    setFieldTouched('givenName', true);
    setFieldTouched('familyName', true);
    setFieldTouched('familyName2', true);
    setFieldTouched(`attributes.${unidentifiedPatientAttributeTypeUuid}`, true, false);
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

  const middleNameField = displayMiddleName && (
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

  const familyName2Field = (
    <Input
      id="familyName2"
      name="familyName2"
      labelText={t('familyName2LabelText', 'Second Family Name')}
      checkWarning={checkNumber}
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
          {(allowUnidentifiedPatients || isPatientUnknown) && (
            <>
              <div className={styles.dobContentSwitcherLabel}>
                <span className={styles.label01}>{t('patientNameKnown', "Patient's Name is Known?")}</span>
              </div>
              <ContentSwitcher
                className={styles.contentSwitcher}
                selectedIndex={isPatientUnknown ? 1 : 0}
                onChange={toggleNameKnown}>
                <Switch name="known" text={t('yes', 'Yes')} />
                <Switch name="unknown" text={t('no', 'No')} />
              </ContentSwitcher>
            </>
          )}
          {!isPatientUnknown &&
            (!displayReverseFieldOrder ? (
              <>
                {firstNameField}
                {middleNameField}
                {familyNameField}
                {familyName2Field}
              </>
            ) : (
              <>
                {familyNameField}
                {familyName2Field}
                {middleNameField}
                {firstNameField}
              </>
            ))}
        </div>
      </div>
    </div>
  );
};
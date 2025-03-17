import React, { useCallback, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useField, useFormikContext } from 'formik';
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
  const { values } = useFormikContext();
  const { setCapturePhotoProps, currentPhoto, setFieldValue, setFieldTouched } = useContext(PatientRegistrationContext);
  const {
    fieldConfigurations: {
      name: {
        displayCapturePhoto,
        allowUnidentifiedPatients,
        defaultUnknownGivenName,
        defaultUnknownFamilyName,
        displayMiddleName,
        displayReverseFieldOrder,
      },
    },
  } = useConfig<RegistrationConfig>();

  const [{ value: isPatientUnknownValue }, , { setValue: setUnknownPatient }] = useField<string>(
    `attributes.${unidentifiedPatientAttributeTypeUuid}`,
  );

  const isPatientUnknown = isPatientUnknownValue === 'true';

  useEffect(() => {
    const firstFamilyName = values.firstFamilyName || '';
    const familiName2 = values.familiName2 || '';
    
    const combinedFamilyName = `${firstFamilyName} ${familiName2}`.trim();
    
    if (combinedFamilyName !== values.familyName) {
      setFieldValue('familyName', combinedFamilyName, false);
    }
  }, [values.firstFamilyName, values.familiName2, values.familyName, setFieldValue]);

  useEffect(() => {
    if (values.familyName && (!values.firstFamilyName && !values.familiName2)) {
      const nameParts = values.familyName.split(' ');
      if (nameParts.length > 0) {
        setFieldValue('firstFamilyName', nameParts[0] || '', false);
        setFieldValue('secondFamilyName', nameParts.slice(1).join(' ') || '', false);
      }
    }
  }, []);

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
      setFieldValue('firstFamilyName', '');
      setFieldValue('familiName2', '');
      setUnknownPatient('false');
    } else {
      setFieldValue('givenName', defaultUnknownGivenName);
      // Dividir el apellido predeterminado si es necesario
      const [firstDefault, ...restDefault] = (defaultUnknownFamilyName || '').split(' ');
      setFieldValue('firstFamilyName', firstDefault || '');
      setFieldValue('familiName2', restDefault.join(' ') || '');
      setUnknownPatient('true');
    }
    setFieldTouched('givenName', true);
    setFieldTouched('firstFamilyName', true);
    setFieldTouched('familiName2', true);
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

  const firstFamilyNameField = (
    <Input
      id="firstFamilyName"
      name="firstFamilyName"
      labelText={t('firstFamilyNameLabelText', 'First Family Name')}
      checkWarning={checkNumber}
      required
    />
  );

  const secondFamilyNameField = (
    <Input
      id="familiName2"
      name="familiName2"
      labelText={t('secondFamilyNameLabelText', 'Second Family Name')}
      checkWarning={checkNumber}
    />
  );

  const hiddenFamilyNameField = (
    <input
      type="hidden"
      id="familyName"
      name="familyName"
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
                {firstFamilyNameField}
                {secondFamilyNameField}
                {hiddenFamilyNameField}
              </>
            ) : (
              <>
                {firstFamilyNameField}
                {secondFamilyNameField}
                {middleNameField}
                {firstNameField}
                {hiddenFamilyNameField}
              </>
            ))}
        </div>
      </div>
    </div>
  );
};
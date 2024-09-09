import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch } from '@carbon/react';
import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import { Input } from '../../input/basic-input/input/input.component';
import { type RegistrationConfig } from '../../../config-schema';
import styles from '../field.scss';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';
import type { FormValues } from '../../patient-registration.types';

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
  const { setCapturePhotoProps, currentPhoto, setValue, control, watch } = usePatientRegistrationContext();
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

  const unknownPatientFieldName = useMemo(
    () => `attributes.${unidentifiedPatientAttributeTypeUuid}` as keyof FormValues,
    [],
  );
  const isPatientUnknownValue = watch(unknownPatientFieldName);
  const setUnknownPatient = useCallback(
    (value: string) => setValue(unknownPatientFieldName, value),
    [unknownPatientFieldName, setValue],
  );

  const isPatientUnknown = isPatientUnknownValue === 'true';

  const onCapturePhoto = useCallback(
    (dataUri: string, photoDateTime: string) => {
      if (setCapturePhotoProps) {
        setCapturePhotoProps({
          imageData: dataUri,
          dateTime: photoDateTime,
        });
        // setFieldTouched('photo', true, false);
      }
    },
    [setCapturePhotoProps],
  );

  const toggleNameKnown = (e) => {
    if (e.name === 'known') {
      setValue('givenName', '');
      setValue('familyName', '');
      setUnknownPatient('false');
    } else {
      setValue('givenName', defaultUnknownGivenName);
      setValue('familyName', defaultUnknownFamilyName);
      setUnknownPatient('true');
    }
    // setFieldTouched('givenName', true);
    // setFieldTouched('familyName', true);
    // setFieldTouched(`attributes.${unidentifiedPatientAttributeTypeUuid}`, true, false);
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

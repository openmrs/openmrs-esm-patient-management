import React, { useCallback, useContext, useEffect, useState } from 'react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { PatientRegistrationContext, useFieldConfig } from '../../patient-registration-context';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import { ContentSwitcher, Switch } from 'carbon-components-react';

const containsNoNumbers = /^([^0-9]*)$/;

function checkNumber(value: string) {
  if (!containsNoNumbers.test(value)) {
    return 'numberInNameDubious';
  }

  return undefined;
}

export const NameField = () => {
  const { t } = useTranslation();
  const { setCapturePhotoProps, currentPhoto, setFieldValue } = useContext(PatientRegistrationContext);
  const { fieldConfigurations } = useConfig();
  const [nameKnown, setNameKnown] = useState(true);

  const onCapturePhoto = useCallback((dataUri: string, photoDateTime: string) => {
    if (setCapturePhotoProps) {
      setCapturePhotoProps({
        imageData: dataUri,
        dateTime: photoDateTime,
      });
    }
  }, []);

  useEffect(() => {
    if (!nameKnown) {
      setFieldValue('givenName', 'unknown');
      setFieldValue('familyName', 'unknown');
      setFieldValue('unknownPatient', `${!nameKnown}}`);
    }
  }, [nameKnown, setFieldValue]);

  const fieldConfigs = useFieldConfig('name');
  const toggleNameKnown = (e) => {
    setNameKnown(e.name === 'known');
  };

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
          <div className={styles.dobContentSwitcherLabel}>
            <span className={styles.label01}>{t('patientNameKnown', "Patient's Name is Known?")}</span>
          </div>
          <ContentSwitcher onChange={toggleNameKnown}>
            <Switch name="known" text={t('yes', 'Yes')} />
            <Switch name="unknown" text={t('no', 'No')} />
          </ContentSwitcher>
          <div style={{ minHeight: '1rem' }}></div>
          {nameKnown ? (
            <>
              <Input
                id="givenName"
                name="givenName"
                labelText={t('givenNameLabelText', 'First Name')}
                light
                checkWarning={checkNumber}
              />
              {fieldConfigs.displayMiddleName && (
                <Input
                  id="middleName"
                  name="middleName"
                  labelText={t('middleNameLabelText', 'Middle Name (optional)')}
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
            </>
          ) : (
            <>
              <input
                name="givenName"
                value={fieldConfigurations?.defaultUnknownGivenName ?? 'UNKNOWN'}
                hidden
                readOnly
              />
              <input
                name="familyName"
                value={fieldConfigurations?.defaultUnknownFamilyName ?? 'UNKNOWN'}
                hidden
                readOnly
              />
            </>
          )}
          <input name="unknownPatient" onChange={() => {}} value={`${!nameKnown}`} hidden />
        </div>
      </div>
    </div>
  );
};

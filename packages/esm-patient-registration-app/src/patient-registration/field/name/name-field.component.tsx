import React, { useContext } from 'react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { ContentSwitcher, Switch } from 'carbon-components-react';
import { useField } from 'formik';

const containsNoNumbers = /^([^0-9]*)$/;

function checkNumber(value: string) {
  if (!containsNoNumbers.test(value)) {
    return 'numberInNameDubious';
  }

  return undefined;
}

export const NameField = () => {
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { t } = useTranslation();
  const { fieldConfigurations } = useConfig();
  const fieldConfigs = fieldConfigurations?.name;
  const [{ value: unidentified }] = useField('unidentifiedPatient');
  const nameKnown = !unidentified;

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

  return (
    <div className={styles.nameField}>
      <div className={styles.dobContentSwitcherLabel}>
        <span className={styles.label01}>{t('patientNameKnown', "Patient's Name is Known?")}</span>
      </div>
      <ContentSwitcher className={styles.contentSwitcher} onChange={toggleNameKnown}>
        <Switch name="known" text={t('yes', 'Yes')} />
        <Switch name="unknown" text={t('no', 'No')} />
      </ContentSwitcher>
      {nameKnown && (
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
      )}
    </div>
  );
};

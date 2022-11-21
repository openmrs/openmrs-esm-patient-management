import React, { useContext } from 'react';
import { RadioButton, RadioButtonGroup } from '@carbon/react';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';
import { RegistrationConfig } from '../../../config-schema';
import { useConfig } from '@openmrs/esm-framework';

export const GenderField: React.FC = () => {
  const { fieldConfigurations } = useConfig() as RegistrationConfig;
  const { t } = useTranslation();
  const [field, meta] = useField('gender');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const fieldConfigs = fieldConfigurations?.gender;

  const setGender = (gender: string) => {
    setFieldValue('gender', gender);
  };
  /**
   * DO NOT REMOVE THIS COMMENT HERE, ADDS TRANSLATION FOR SEX OPTIONS
   * t('male', 'Male')
   * t('female', 'Female')
   * t('other', 'Other')
   * t('unknown', 'Unknown')
   */

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('sexFieldLabelText', 'Sex')}</h4>
      <div className={styles.sexField}>
        <p className="cds--label">{t('genderLabelText', 'Sex')}</p>
        <RadioButtonGroup name="gender" orientation="vertical" onChange={setGender} valueSelected={field.value}>
          {fieldConfigs.map((option) => (
            <RadioButton
              key={option.label}
              id={option.id}
              value={option.value}
              labelText={t(`${option.label}`, `${option.label}`)}
            />
          ))}
        </RadioButtonGroup>
        {meta.touched && meta.error && (
          <div className={styles.radioFieldError}>{t(meta.error, 'Gender is required')}</div>
        )}
      </div>
    </div>
  );
};

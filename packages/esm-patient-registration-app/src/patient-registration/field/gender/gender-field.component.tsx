import React from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButton, RadioButtonGroup } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { useRegistrationField } from '../../form-adapter';
import { usePatientRegistrationContext } from '../../patient-registration-context';
import type { RegistrationConfig } from '../../../config-schema';
import styles from '../field.scss';

export const GenderField: React.FC = () => {
  const { t } = useTranslation();
  const { fieldConfigurations } = useConfig<RegistrationConfig>();
  const { setFieldValue, setFieldTouched } = usePatientRegistrationContext();
  const { field, error, touched } = useRegistrationField<string>('gender');
  const fieldConfigs = fieldConfigurations?.gender;

  const setGender = (gender: string) => {
    setFieldValue('gender', gender);
    setFieldTouched('gender', true, false);
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
        <RadioButtonGroup
          name="gender"
          legendText={t('genderLabelText', 'Sex')}
          orientation="vertical"
          onChange={setGender}
          valueSelected={field.value}>
          {fieldConfigs.map((option) => (
            <RadioButton
              id={`gender-option-${option.value}`}
              key={option.label ?? option.value}
              labelText={t(option.label ?? option.value, option.label ?? option.value)}
              value={option.value}
            />
          ))}
        </RadioButtonGroup>
        {touched && error && <div className={styles.radioFieldError}>{t(error, 'Gender is required')}</div>}
      </div>
    </div>
  );
};

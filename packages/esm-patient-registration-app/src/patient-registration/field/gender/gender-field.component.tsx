import React, { useContext } from 'react';
import { RadioButton, RadioButtonGroup } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';
import { type RegistrationConfig } from '../../../config-schema';
import { useConfig } from '@openmrs/esm-framework';
import styles from '../field.scss';
import { Controller } from 'react-hook-form';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';

export const GenderField: React.FC = () => {
  const { fieldConfigurations } = useConfig<RegistrationConfig>();
  const { t } = useTranslation();
  const { control } = usePatientRegistrationContext();
  const fieldConfigs = fieldConfigurations?.gender;

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
        <Controller
          control={control}
          name="gender"
          render={({ field, fieldState: { isTouched, error } }) => (
            <RadioButtonGroup
              {...field}
              orientation="vertical"
              valueSelected={field.value}
              invalid={isTouched && error?.message}
              invalidText={error?.message}>
              {fieldConfigs.map((option) => (
                <RadioButton
                  key={option.label ?? option.value}
                  id={`gender-option-${option.value}`}
                  value={option.value}
                  labelText={t(option.label ?? option.value, option.label ?? option.value)}
                />
              ))}
            </RadioButtonGroup>
          )}
        />
      </div>
    </div>
  );
};

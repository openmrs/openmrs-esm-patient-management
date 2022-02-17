import React, { useContext, useRef, useState } from 'react';
import { DatePicker, DatePickerInput, TextInput, Toggle } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { generateFormatting } from '../../date-util';
import ContentSwitcher from './content-switcher.component';
import styles from '../field.scss';

export const DobField: React.FC = () => {
  const { t } = useTranslation();
  const [field, meta] = useField('birthdate');
  const [dobEstimated] = useField('birthdateEstimated');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { format, placeHolder, dateFormat } = generateFormatting(['d', 'm', 'Y'], '/');
  const invalidText = meta.error && t(meta.error);
  const today = new Date();
  const dobKnown = !dobEstimated.value;

  const onToggle = (dobKnown: boolean) => {
    setFieldValue('birthdateEstimated', !dobKnown);
    setFieldValue('birthdate', '');
  };

  const onDateChange = ([birthdate]) => {
    setFieldValue('birthdate', birthdate);
  };

  const onEstimatedAgeChange = (ev) => {
    const years = +ev.target.value;

    if (!isNaN(years) && years < 140 && years >= 0) {
      setFieldValue('birthdate', new Date(today.getFullYear() - years, 0, 1));
    }
  };

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('birthFieldLabelText', 'Birth')}</h4>
      <div className={styles.dobField}>
        <div className={styles.dobContentSwitcherLabel}>
          <span className={styles.label01}>{t('dobToggleLabelText', 'Date of Birth Known?')}</span>
        </div>
        <ContentSwitcher onToggle={onToggle} />
      </div>
      {dobKnown ? (
        <div className={styles.dobField}>
          <DatePicker
            dateFormat={dateFormat}
            datePickerType="single"
            light
            onChange={onDateChange}
            maxDate={format(today)}>
            <DatePickerInput
              id="birthdate"
              {...field}
              placeholder={placeHolder}
              labelText={t('dateOfBirthLabelText', 'Date of Birth')}
              invalid={dobKnown && !!(meta.touched && meta.error)}
              invalidText={invalidText}
              value={format(field.value)}
              disabled={!dobKnown}
            />
          </DatePicker>
        </div>
      ) : (
        <div className={styles.dobField}>
          <TextInput
            id="birthdateEstimated"
            type="number"
            light
            onChange={onEstimatedAgeChange}
            labelText={t('estimatedYearsLabelText', 'Estimated Years')}
            value={dobEstimated.value && field.value ? `${today.getFullYear() - field.value.getFullYear()}` : ''}
            disabled={dobKnown}
            min={0}
          />
        </div>
      )}
    </div>
  );
};

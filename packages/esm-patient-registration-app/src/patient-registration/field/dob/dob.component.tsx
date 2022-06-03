import React, { useContext } from 'react';
import { ContentSwitcher, DatePicker, DatePickerInput, Switch, TextInput } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { generateFormatting } from '../../date-util';
import styles from '../field.scss';

export const DobField: React.FC = () => {
  const { t } = useTranslation();
  const [dobUnknown] = useField('birthdateEstimated');
  const dobKnown = !dobUnknown.value;
  const [birthdate, birthdateMeta] = useField('birthdate');
  const [yearsEstimated, YearsEstimateMeta] = useField('yearsEstimated');
  const [monthsEstimated, monthsEstimateMeta] = useField('monthsEstimated');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { format, placeHolder, dateFormat } = generateFormatting(['d', 'm', 'Y'], '/');
  const today = new Date();

  const onToggle = (e) => {
    setFieldValue('birthdateEstimated', e.name === 'unknown');
    setFieldValue('birthdate', '');
    setFieldValue('yearsEstimated', '');
    setFieldValue('monthsEstimated', '');
  };

  const onDateChange = ([birthdate]) => {
    setFieldValue('birthdate', birthdate);
  };

  const onEstimatedYearsChange = (ev) => {
    const years = +ev.target.value;

    if (!isNaN(years) && years < 140 && years >= 0) {
      setFieldValue('yearsEstimated', years);
      setFieldValue('birthdate', new Date(today.getFullYear() - years, today.getMonth() - monthsEstimateMeta.value, 1));
    }
  };

  const onEstimatedMonthsChange = (e) => {
    const months = +e.target.value;

    if (!isNaN(months) && months < 11 && months >= 0) {
      const estimate_Months = YearsEstimateMeta.value * 12 + months;

      setFieldValue('monthsEstimated', months);
      setFieldValue(
        'birthdate',
        new Date(today.getFullYear() - YearsEstimateMeta.value, today.getMonth() - estimate_Months, 1),
      );
    }
  };

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('birthFieldLabelText', 'Birth')}</h4>
      <div className={styles.dobField}>
        <div className={styles.dobContentSwitcherLabel}>
          <span className={styles.label01}>{t('dobToggleLabelText', 'Date of Birth Known?')}</span>
        </div>
        <ContentSwitcher onChange={onToggle}>
          <Switch name="known" text={t('yes', 'Yes')} />
          <Switch name="unknown" text={t('no', 'No')} />
        </ContentSwitcher>
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
              {...birthdate}
              placeholder={placeHolder}
              labelText={t('dateOfBirthLabelText', 'Date of Birth')}
              invalid={!!(birthdateMeta.touched && birthdateMeta.error)}
              invalidText={birthdateMeta.error && t(birthdateMeta.error)}
              value={format(birthdate.value)}
            />
          </DatePicker>
        </div>
      ) : (
        <div className={styles.grid}>
          <TextInput
            id="yearsEstimated"
            type="number"
            light
            onChange={onEstimatedYearsChange}
            labelText={t('estimatedYearsLabelText', 'Estimated Years')}
            invalid={!!(YearsEstimateMeta.touched && YearsEstimateMeta.error)}
            invalidText={YearsEstimateMeta.error && t(YearsEstimateMeta.error)}
            value={yearsEstimated.value}
            min={0}
          />
          <TextInput
            id="monthsEstimated"
            type="number"
            light
            onChange={onEstimatedMonthsChange}
            labelText={t('estimatedMonthsLabelText', 'Estimated Months')}
            invalid={!!(monthsEstimateMeta.touched && monthsEstimateMeta.error)}
            invalidText={monthsEstimateMeta.error && t(monthsEstimateMeta.error)}
            value={monthsEstimated.value}
            min={0}
          />
        </div>
      )}
    </div>
  );
};

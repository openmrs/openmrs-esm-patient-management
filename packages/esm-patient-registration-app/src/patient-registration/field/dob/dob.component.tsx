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
  const [ageEstimate, ageEstimateMeta] = useField('ageEstimate');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { format, placeHolder, dateFormat } = generateFormatting(['d', 'm', 'Y'], '/');
  const today = new Date();

  const onToggle = (e) => {
    setFieldValue('birthdateEstimated', e.name === 'unknown');
    setFieldValue('birthdate', '');
    setFieldValue('ageEstimate', '');
  };

  const onDateChange = ([birthdate]) => {
    setFieldValue('birthdate', birthdate);
  };

  const onEstimatedAgeChange = (ev) => {
    const years = +ev.target.value;

    if (!isNaN(years) && years < 140 && years >= 0) {
      setFieldValue('birthdate', new Date(today.getFullYear() - years, 0, 1));
      setFieldValue('ageEstimate', years);
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
        <div className={styles.dobField}>
          <TextInput
            id="ageEstimate"
            type="number"
            light
            onChange={onEstimatedAgeChange}
            labelText={t('estimatedYearsLabelText', 'Estimated Years')}
            invalid={!!(ageEstimateMeta.touched && ageEstimateMeta.error)}
            invalidText={ageEstimateMeta.error && t(ageEstimateMeta.error)}
            value={ageEstimate.value}
            min={0}
          />
        </div>
      )}
    </div>
  );
};

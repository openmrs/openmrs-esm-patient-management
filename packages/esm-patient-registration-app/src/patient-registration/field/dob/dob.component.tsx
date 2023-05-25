import React, { useContext } from 'react';
import { ContentSwitcher, DatePicker, DatePickerInput, Switch, TextInput, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { generateFormatting } from '../../date-util';
import { PatientRegistrationContext } from '../../patient-registration-context';
import styles from '../field.scss';
import { useConfig } from '@openmrs/esm-framework';
import { RegistrationConfig } from '../../../config-schema';

const calcBirthdate = (yearDelta, monthDelta, dateOfBirth) => {
  const { enabled, month, dayOfMonth } = dateOfBirth.useEstimatedDateOfBirth;
  const startDate = new Date();
  const resultMonth = new Date(startDate.getFullYear() - yearDelta, startDate.getMonth() - monthDelta, 1);
  const daysInResultMonth = new Date(resultMonth.getFullYear(), resultMonth.getMonth() + 1, 0).getDate();
  const resultDate = new Date(
    resultMonth.getFullYear(),
    resultMonth.getMonth(),
    Math.min(startDate.getDate(), daysInResultMonth),
  );
  return enabled ? new Date(resultDate.getFullYear(), month, dayOfMonth) : resultDate;
};

export const DobField: React.FC = () => {
  const { t } = useTranslation();
  const {
    fieldConfigurations: { dateOfBirth },
  } = useConfig<RegistrationConfig>();
  const allowEstimatedBirthDate = dateOfBirth?.useEstimatedDateOfBirth?.enabled;
  const [dobUnknown] = useField('birthdateEstimated');
  const dobKnown = !dobUnknown.value;
  const [birthdate, birthdateMeta] = useField('birthdate');
  const [yearsEstimated, yearsEstimateMeta] = useField('yearsEstimated');
  const [monthsEstimated, monthsEstimateMeta] = useField('monthsEstimated');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { format, placeHolder, dateFormat } = generateFormatting(['d', 'm', 'Y'], '/');
  const today = new Date();

  const onToggle = (e) => {
    setFieldValue('birthdateEstimated', e.name === 'unknown');
    setFieldValue('birthdate', '');
    setFieldValue('yearsEstimated', 0);
    setFieldValue('monthsEstimated', '');
  };

  const onDateChange = ([birthdate]) => {
    setFieldValue('birthdate', birthdate);
  };

  const onEstimatedYearsChange = (ev) => {
    const years = +ev.target.value;

    if (!isNaN(years) && years < 140 && years >= 0) {
      setFieldValue('yearsEstimated', years);
      setFieldValue('birthdate', calcBirthdate(years, monthsEstimateMeta.value, dateOfBirth));
    }
  };

  const onEstimatedMonthsChange = (e) => {
    const months = +e.target.value;

    if (!isNaN(months)) {
      setFieldValue('monthsEstimated', months);
      setFieldValue('birthdate', calcBirthdate(yearsEstimateMeta.value, months, dateOfBirth));
    }
  };

  const updateBirthdate = () => {
    const months = +monthsEstimateMeta.value % 12;
    const years = +yearsEstimateMeta.value + Math.floor(monthsEstimateMeta.value / 12);
    setFieldValue('yearsEstimated', years);
    setFieldValue('monthsEstimated', months > 0 ? months : '');
    setFieldValue('birthdate', calcBirthdate(years, months, dateOfBirth));
  };

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('birthFieldLabelText', 'Birth')}</h4>
      {(allowEstimatedBirthDate || !dobKnown) && (
        <div className={styles.dobField}>
          <div className={styles.dobContentSwitcherLabel}>
            <span className={styles.label01}>{t('dobToggleLabelText', 'Date of Birth Known?')}</span>
          </div>
          <ContentSwitcher onChange={onToggle} selectedIndex={dobKnown ? 0 : 1}>
            <Switch name="known" text={t('yes', 'Yes')} />
            <Switch name="unknown" text={t('no', 'No')} />
          </ContentSwitcher>
        </div>
      )}
      <Layer>
        {dobKnown ? (
          <div className={styles.dobField}>
            <DatePicker dateFormat={dateFormat} datePickerType="single" onChange={onDateChange} maxDate={format(today)}>
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
            <div className={styles.dobField}>
              <TextInput
                id="yearsEstimated"
                type="number"
                name={yearsEstimated.name}
                light
                onChange={onEstimatedYearsChange}
                labelText={t('estimatedAgeInYearsLabelText', 'Estimated age in years')}
                invalid={!!(yearsEstimateMeta.touched && yearsEstimateMeta.error)}
                invalidText={yearsEstimateMeta.error && t(yearsEstimateMeta.error)}
                value={yearsEstimated.value}
                min={0}
                required
                {...yearsEstimated}
                onBlur={updateBirthdate}
              />
            </div>
            <div className={styles.dobField}>
              <TextInput
                id="monthsEstimated"
                type="number"
                name={monthsEstimated.name}
                light
                onChange={onEstimatedMonthsChange}
                labelText={t('estimatedAgeInMonthsLabelText', 'Estimated age in months')}
                invalid={!!(monthsEstimateMeta.touched && monthsEstimateMeta.error)}
                invalidText={monthsEstimateMeta.error && t(monthsEstimateMeta.error)}
                value={monthsEstimated.value}
                min={0}
                {...monthsEstimated}
                required={!yearsEstimateMeta.value}
                onBlur={updateBirthdate}
              />
            </div>
          </div>
        )}
      </Layer>
    </div>
  );
};

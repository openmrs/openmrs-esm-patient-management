import React, { useContext } from 'react';
import { ContentSwitcher, Layer, Switch, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { generateFormatting } from '../../date-util';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { RegistrationConfig } from '../../../config-schema';
import styles from '../field.scss';

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
  const allowEstimatedBirthDate = dateOfBirth?.allowEstimatedDateOfBirth;
  const [{ value: dobUnknown }] = useField('birthdateEstimated');
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

  const onDateChange = (birthdate) => {
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
      {(allowEstimatedBirthDate || dobUnknown) && (
        <div className={styles.dobField}>
          <div className={styles.dobContentSwitcherLabel}>
            <span className={styles.label01}>{t('dobToggleLabelText', 'Date of Birth Known?')}</span>
          </div>
          <ContentSwitcher onChange={onToggle} selectedIndex={dobUnknown ? 1 : 0}>
            <Switch name="known" text={t('yes', 'Yes')} />
            <Switch name="unknown" text={t('no', 'No')} />
          </ContentSwitcher>
        </div>
      )}
      <Layer>
        {!dobUnknown ? (
          <div className={styles.dobField}>
            <OpenmrsDatePicker
              id="birthdate"
              {...birthdate}
              dateFormat={dateFormat}
              onChange={onDateChange}
              maxDate={format(today)}
              labelText={t('dateOfBirthLabelText', 'Date of Birth')}
              invalid={!!(birthdateMeta.touched && birthdateMeta.error)}
              invalidText={birthdateMeta.error && t(birthdateMeta.error)}
              value={format(birthdate.value)}
              carbonOptions={{
                placeholder: placeHolder,
              }}
            />
          </div>
        ) : (
          <div className={styles.grid}>
            <div className={styles.dobField}>
              <Layer>
                <TextInput
                  id="yearsEstimated"
                  type="number"
                  name={yearsEstimated.name}
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
              </Layer>
            </div>
            <div className={styles.dobField}>
              <Layer>
                <TextInput
                  id="monthsEstimated"
                  type="number"
                  name={monthsEstimated.name}
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
              </Layer>
            </div>
          </div>
        )}
      </Layer>
    </div>
  );
};

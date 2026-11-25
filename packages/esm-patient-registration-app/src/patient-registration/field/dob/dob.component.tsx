import React, { type ChangeEvent, useCallback } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Layer, Switch, TextInput } from '@carbon/react';
import { OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { useRegistrationField } from '../../form-adapter';
import { usePatientRegistrationContext } from '../../patient-registration-context';
import type { FormValues } from '../../patient-registration.types';
import type { RegistrationConfig } from '../../../config-schema';
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
  const dobUnknown = useWatch<FormValues, 'birthdateEstimated'>({ name: 'birthdateEstimated' });
  const { field: birthdate, error: birthdateError, touched: birthdateTouched } = useRegistrationField('birthdate');
  const {
    field: yearsEstimated,
    error: yearsEstimatedError,
    touched: yearsEstimatedTouched,
  } = useRegistrationField('yearsEstimated');
  const {
    field: monthsEstimated,
    error: monthsEstimatedError,
    touched: monthsEstimatedTouched,
  } = useRegistrationField('monthsEstimated');
  const { setFieldValue, setFieldTouched } = usePatientRegistrationContext();
  const today = new Date();

  const onToggle = useCallback(
    (e: { name?: string | number }) => {
      setFieldValue('birthdateEstimated', e.name === 'unknown');
      setFieldValue('birthdate', '');
      setFieldValue('yearsEstimated', 0);
      setFieldValue('monthsEstimated', '');
      setFieldTouched('birthdateEstimated', true, false);
    },
    [setFieldTouched, setFieldValue],
  );

  const onDateChange = useCallback(
    (birthdate: Date) => {
      setFieldValue('birthdate', birthdate);
      setFieldTouched('birthdate', true, false);
    },
    [setFieldValue, setFieldTouched],
  );

  const onEstimatedYearsChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const years = +ev.target.value;

      if (!isNaN(years) && years < 140 && years >= 0) {
        setFieldValue('yearsEstimated', years);
        setFieldValue('birthdate', calcBirthdate(years, monthsEstimated.value, dateOfBirth));
      }
    },
    [setFieldValue, dateOfBirth, monthsEstimated.value],
  );

  const onEstimatedMonthsChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const months = +ev.target.value;

      if (!isNaN(months)) {
        setFieldValue('monthsEstimated', months);
        setFieldValue('birthdate', calcBirthdate(yearsEstimated.value, months, dateOfBirth));
      }
    },
    [setFieldValue, dateOfBirth, yearsEstimated.value],
  );

  const updateBirthdate = useCallback(() => {
    const months = +monthsEstimated.value % 12;
    const years = +yearsEstimated.value + Math.floor(monthsEstimated.value / 12);
    setFieldValue('yearsEstimated', years);
    setFieldValue('monthsEstimated', months > 0 ? months : '');
    setFieldValue('birthdate', calcBirthdate(years, months, dateOfBirth));
    setFieldTouched('yearsEstimated', true, false);
    setFieldTouched('monthsEstimated', true, false);
    setFieldTouched('birthdate', true, false);
  }, [setFieldValue, setFieldTouched, monthsEstimated.value, yearsEstimated.value, dateOfBirth]);

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('birthFieldLabelText', 'Birth')}</h4>
      {(allowEstimatedBirthDate || dobUnknown) && (
        <div className={styles.dobField}>
          <div className={styles.dobContentSwitcherLabel}>
            <span className={styles.label01}>{t('dobToggleLabelText', 'Date of birth known?')}</span>
          </div>
          <ContentSwitcher size="md" onChange={onToggle} selectedIndex={dobUnknown ? 1 : 0}>
            <Switch name="known">{t('yes', 'Yes')}</Switch>
            <Switch name="unknown">{t('no', 'No')}</Switch>
          </ContentSwitcher>
        </div>
      )}
      <Layer>
        {!dobUnknown ? (
          <div className={styles.dobField}>
            <OpenmrsDatePicker
              id="birthdate"
              data-testid="birthdate"
              {...birthdate}
              onChange={onDateChange}
              onBlur={() => setFieldTouched('birthdate', true, false)}
              maxDate={today}
              labelText={t('dateOfBirthLabelText', 'Date of birth')}
              isInvalid={!!(birthdateTouched && birthdateError)}
              invalidText={t(birthdateError)}
              value={birthdate.value}
            />
          </div>
        ) : (
          <div className={styles.grid}>
            <div className={styles.dobField}>
              <TextInput
                id="yearsEstimated"
                type="number"
                name={yearsEstimated.name}
                onChange={onEstimatedYearsChange}
                labelText={t('estimatedAgeInYearsLabelText', 'Estimated age in years')}
                invalid={!!(yearsEstimatedTouched && yearsEstimatedError)}
                invalidText={yearsEstimatedError && t(yearsEstimatedError)}
                value={yearsEstimated.value}
                min={0}
                required
                {...yearsEstimated}
                onBlur={(e) => {
                  yearsEstimated.onBlur(e);
                  setFieldTouched('yearsEstimated', true, false);
                  updateBirthdate();
                }}
              />
            </div>
            <div className={styles.dobField}>
              <TextInput
                id="monthsEstimated"
                type="number"
                name={monthsEstimated.name}
                onChange={onEstimatedMonthsChange}
                labelText={t('estimatedAgeInMonthsLabelText', 'Estimated age in months')}
                invalid={!!(monthsEstimatedTouched && monthsEstimatedError)}
                invalidText={monthsEstimatedError && t(monthsEstimatedError)}
                value={monthsEstimated.value}
                min={0}
                {...monthsEstimated}
                required={!yearsEstimated.value}
                onBlur={(e) => {
                  monthsEstimated.onBlur(e);
                  setFieldTouched('monthsEstimated', true, false);
                  updateBirthdate();
                }}
              />
            </div>
          </div>
        )}
      </Layer>
    </div>
  );
};

import React, { type ChangeEvent, useCallback, useContext } from 'react';
import { ContentSwitcher, Layer, Switch, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { OpenmrsDatePicker, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../../../config-schema';
import styles from '../field.scss';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';
import { Controller } from 'react-hook-form';

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
  const { watch, control, setValue } = usePatientRegistrationContext();
  const dobUnknown = watch('birthdateEstimated');
  const today = new Date();
  const monthsEstimated = watch('monthsEstimated');
  const yearsEstimated = watch('yearsEstimated');

  const onToggle = useCallback(
    (e: { name?: string | number }) => {
      setValue('birthdateEstimated', e.name === 'unknown');
      setValue('birthdate', '');
      setValue('yearsEstimated', 0);
      setValue('monthsEstimated', undefined);
      // setFieldTouched('birthdateEstimated', true, false);
    },
    [setValue],
  );

  const onDateChange = useCallback(
    (birthdate: Date) => {
      setValue('birthdate', birthdate);
      // setFieldTouched('birthdate', true, false);
    },
    [setValue],
  );

  const onEstimatedYearsChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const years = +ev.target.value;

      if (!isNaN(years) && years < 140 && years >= 0) {
        setValue('yearsEstimated', years);
        setValue('birthdate', calcBirthdate(years, monthsEstimated, dateOfBirth));
      }
    },
    [setValue, dateOfBirth, monthsEstimated],
  );

  const onEstimatedMonthsChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const months = +ev.target.value;

      if (!isNaN(months)) {
        setValue('monthsEstimated', months);
        setValue('birthdate', calcBirthdate(yearsEstimated, months, dateOfBirth));
      }
    },
    [setValue, dateOfBirth, yearsEstimated],
  );

  const updateBirthdate = useCallback(() => {
    const months = +monthsEstimated % 12;
    const years = +yearsEstimated + Math.floor(monthsEstimated / 12);
    setValue('yearsEstimated', years);
    setValue('monthsEstimated', months > 0 ? months : undefined);
    setValue('birthdate', calcBirthdate(years, months, dateOfBirth));
  }, [setValue, monthsEstimated, yearsEstimated, dateOfBirth]);

  return (
    <div className={styles.halfWidthInDesktopView}>
      <h4 className={styles.productiveHeading02Light}>{t('birthFieldLabelText', 'Birth')}</h4>
      {(allowEstimatedBirthDate || dobUnknown) && (
        <div className={styles.dobField}>
          <div className={styles.dobContentSwitcherLabel}>
            <span className={styles.label01}>{t('dobToggleLabelText', 'Date of birth known?')}</span>
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
            <Controller
              control={control}
              name="birthdate"
              render={({ field, fieldState: { isTouched, error } }) => (
                <OpenmrsDatePicker
                  id="birthdate"
                  {...field}
                  onChange={onDateChange}
                  maxDate={today}
                  labelText={t('dateOfBirthLabelText', 'Date of birth')}
                  isInvalid={!!(isTouched && error?.message)}
                  invalidText={error?.message}
                />
              )}
            />
          </div>
        ) : (
          <div className={styles.grid}>
            <div className={styles.dobField}>
              <Controller
                control={control}
                name="yearsEstimated"
                render={({ field, fieldState: { isTouched, error } }) => (
                  <TextInput
                    {...field}
                    id="yearsEstimated"
                    type="number"
                    onChange={onEstimatedYearsChange}
                    labelText={t('estimatedAgeInYearsLabelText', 'Estimated age in years')}
                    invalid={Boolean(isTouched && error?.message)}
                    invalidText={error?.message}
                    min={0}
                    required
                    onBlur={updateBirthdate}
                  />
                )}
              />
            </div>
            <div className={styles.dobField}>
              <Controller
                control={control}
                name="monthsEstimated"
                render={({ field, fieldState: { isTouched, error } }) => (
                  <TextInput
                    {...field}
                    id="monthsEstimated"
                    type="number"
                    onChange={onEstimatedMonthsChange}
                    labelText={t('estimatedAgeInMonthsLabelText', 'Estimated age in months')}
                    invalid={Boolean(isTouched && error?.message)}
                    invalidText={error?.message}
                    min={0}
                    required={!yearsEstimated}
                    onBlur={updateBirthdate}
                  />
                )}
              />
            </div>
          </div>
        )}
      </Layer>
    </div>
  );
};

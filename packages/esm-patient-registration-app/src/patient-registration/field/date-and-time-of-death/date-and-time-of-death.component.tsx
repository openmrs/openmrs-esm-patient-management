import React, { useCallback, useContext } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Layer, SelectItem, TimePicker, TimePickerSelect } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { OpenmrsDatePicker } from '@openmrs/esm-framework';
import { PatientRegistrationContext } from '../../patient-registration-context';
import styles from '../field.scss';
import { Controller } from 'react-hook-form';

export const DateAndTimeOfDeathField: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.dodField, styles.halfWidthInDesktopView)}>
      <h4 className={styles.productiveHeading02Light}>{t('deathDateInputLabel', 'Date of Death')}</h4>
      <span>
        <DeathDateField />
        <DeathTimeField />
      </span>
    </div>
  );
};

function DeathDateField() {
  const { watch, setValue, control } = useContext(PatientRegistrationContext);
  const isDead = watch('isDead');
  const { t } = useTranslation();
  const today = dayjs().hour(23).minute(59).second(59).toDate();
  const onDateChange = useCallback((selectedDate: Date) => {
    setValue(
      'deathDate',
      selectedDate ? dayjs(selectedDate).hour(0).minute(0).second(0).millisecond(0).toDate() : undefined,
    );
  }, []);

  return (
    <Controller
      control={control}
      name="deathDate"
      render={({ field, fieldState: { isTouched, error } }) => (
        <Layer>
          <OpenmrsDatePicker
            {...field}
            id="deathDate"
            invalidText={error?.message}
            invalid={Boolean(isTouched && error?.message)}
            isRequired={isDead}
            labelText={t('deathDateInputLabel', 'Date of death')}
            maxDate={today}
            onChange={onDateChange}
          />
        </Layer>
      )}
    />
  );
}

function DeathTimeField() {
  const { t } = useTranslation();
  const { control } = useContext(PatientRegistrationContext);

  return (
    <Controller
      name="deathTime"
      control={control}
      render={({ field, fieldState: { isTouched, error } }) => (
        <Layer>
          <TimePicker
            {...field}
            id="time-picker"
            labelText={t('timeOfDeathInputLabel', 'Time of death (hh:mm)')}
            className={styles.timeOfDeathField}
            pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
            invalid={Boolean(isTouched && error?.message)}
            invalidText={error?.message}>
            <Controller
              control={control}
              name="deathTimeFormat"
              render={({ field: deathTimeFormatField, fieldState: { isTouched, error } }) => (
                <TimePickerSelect
                  {...deathTimeFormatField}
                  id="time-format-picker"
                  aria-label={t('timeFormat', 'Time Format')}
                  invalid={Boolean(isTouched && error?.message)}
                  invalidText={error?.message}>
                  <SelectItem value="AM" text="AM" />
                  <SelectItem value="PM" text="PM" />
                </TimePickerSelect>
              )}
            />
          </TimePicker>
        </Layer>
      )}
    />
  );
}

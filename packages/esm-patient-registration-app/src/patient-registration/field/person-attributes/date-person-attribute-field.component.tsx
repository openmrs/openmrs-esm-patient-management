import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { Field } from 'formik';
import { useTranslation } from 'react-i18next';
import { Layer } from '@carbon/react';
import { OpenmrsDatePicker } from '@openmrs/esm-framework';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import styles from './../field.scss';

export interface DatePersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  label?: string;
  required?: boolean;
  allowPastDates?: boolean;
  allowFutureDates?: boolean;
}

/** The day a saved value names; the server answers a date attribute as an ISO date-time. */
const toDate = (value: unknown) => (typeof value === 'string' && value ? dayjs(value.slice(0, 10)).toDate() : null);

export function DatePersonAttributeField({
  id,
  personAttributeType,
  label,
  required,
  allowPastDates,
  allowFutureDates,
}: DatePersonAttributeFieldProps) {
  const { t } = useTranslation();
  const fieldName = `attributes.${personAttributeType.uuid}`;

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Layer>
        <Field name={fieldName}>
          {({ field, form: { touched, errors, setFieldValue }, meta }) => (
            <OpenmrsDatePicker
              id={id}
              isRequired={required}
              labelText={label ?? personAttributeType?.display}
              value={toDate(field.value)}
              // AttributableDate, the date format the server stores, reads and writes YYYY-MM-DD.
              onChange={(date: Date) => setFieldValue(fieldName, date ? dayjs(date).format('YYYY-MM-DD') : '')}
              isInvalid={!!(errors[fieldName] && touched[fieldName])}
              invalidText={meta.error && t(meta.error)}
              minDate={allowPastDates === false ? new Date() : undefined}
              maxDate={allowFutureDates === false ? new Date() : undefined}
            />
          )}
        </Field>
      </Layer>
    </div>
  );
}

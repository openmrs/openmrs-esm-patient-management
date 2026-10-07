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
  const futureDatesAllowed = allowFutureDates ?? true;
  const pastDatesAllowed = allowPastDates ?? true;

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Layer>
        <Field name={fieldName}>
          {({ field, form: { touched, errors, setFieldValue, setFieldTouched }, meta }) => {
            return (
              <OpenmrsDatePicker
                id={id}
                isRequired={required}
                labelText={label ?? personAttributeType?.display}
                value={field.value ? dayjs(field.value).toDate() : null}
                onChange={(date: Date) => {
                  // Date attributes are saved in the YYYY-MM-DD format
                  setFieldValue(fieldName, date ? dayjs(date).format('YYYY-MM-DD') : '');
                  setFieldTouched(fieldName, true, false);
                }}
                isInvalid={errors[fieldName] && touched[fieldName]}
                invalidText={t(meta.error)}
                minDate={!pastDatesAllowed ? new Date() : undefined}
                maxDate={!futureDatesAllowed ? new Date() : undefined}
              />
            );
          }}
        </Field>
      </Layer>
    </div>
  );
}

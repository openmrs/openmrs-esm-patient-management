import React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Layer } from '@carbon/react';
import { OpenmrsDatePicker } from '@openmrs/esm-framework';
import { useFormHelpers, useRegistrationField } from '../../form-adapter';
import type { PersonAttributeTypeResponse } from '../../patient-registration.types';
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
  const {
    field: { value },
    error,
  } = useRegistrationField<string>(fieldName);
  const { setFieldValue, setFieldTouched } = useFormHelpers();
  const futureDatesAllowed = allowFutureDates ?? true;
  const pastDatesAllowed = allowPastDates ?? true;

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Layer>
        <OpenmrsDatePicker
          id={id}
          isRequired={required}
          labelText={label ?? personAttributeType?.display}
          value={value ? dayjs(value).toDate() : null}
          onChange={(date: Date) => {
            // Date attributes are saved in the YYYY-MM-DD format
            setFieldValue(fieldName, date ? dayjs(date).format('YYYY-MM-DD') : '');
            setFieldTouched(fieldName, true, false);
          }}
          invalidText={t(error)}
          minDate={!pastDatesAllowed ? new Date() : undefined}
          maxDate={!futureDatesAllowed ? new Date() : undefined}
        />
      </Layer>
    </div>
  );
}

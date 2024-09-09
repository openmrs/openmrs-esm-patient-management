import React from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layer } from '@carbon/react';
import { Field } from '../../field/field.component';
import styles from './../section.scss';
import { Controller, useFormContext } from 'react-hook-form';
import { type FormValues } from '../../patient-registration.types';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';

export interface DeathInfoSectionProps {
  fields: Array<string>;
}

export const DeathInfoSection: React.FC<DeathInfoSectionProps> = ({ fields }) => {
  const { t } = useTranslation();
  const { watch, control } = usePatientRegistrationContext();
  const isDead = watch('isDead');

  return (
    <section className={styles.formSection} aria-label="Death Info Section">
      <section className={styles.fieldGroup}>
        <Layer>
          <div className={styles.isDeadFieldContainer}>
            <Controller
              control={control}
              name="isDead"
              render={({ field, fieldState }) => (
                <Checkbox {...field} id="isDead" labelText={t('isDeadInputLabel', 'Is dead')} />
              )}
            />
          </div>
        </Layer>
        {isDead ? fields.map((field) => <Field key={`death-info-${field}`} name={field} />) : null}
      </section>
    </section>
  );
};

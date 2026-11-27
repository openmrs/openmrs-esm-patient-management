import React from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layer } from '@carbon/react';
import { useFormHelpers } from '../../form-adapter';
import { Field } from '../../field/field.component';
import type { FormValues } from '../../patient-registration.types';
import styles from './../section.scss';

export interface DeathInfoSectionProps {
  fields: Array<string>;
}

export const DeathInfoSection: React.FC<DeathInfoSectionProps> = ({ fields }) => {
  const { t } = useTranslation();
  const isDead = useWatch<FormValues, 'isDead'>({ name: 'isDead' });
  const { setFieldValue } = useFormHelpers();
  const today = new Date();

  return (
    <section className={styles.formSection} aria-label="Death Info Section">
      <section className={styles.fieldGroup}>
        <Layer>
          <div className={styles.isDeadFieldContainer}>
            <Checkbox
              checked={isDead}
              id="isDead"
              labelText={t('isDeadInputLabel', 'Is dead')}
              onChange={(event, { checked, id }) => setFieldValue(id, checked)}
            />
          </div>
        </Layer>
        {isDead ? fields.map((field) => <Field key={`death-info-${field}`} name={field} />) : null}
      </section>
    </section>
  );
};

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layer } from '@carbon/react';
import { useField } from 'formik';
import { Field } from '../../field/field.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import styles from './../section.scss';
import { useFormContext } from 'react-hook-form';
import { type FormValues } from '../../patient-registration.types';

export interface DeathInfoSectionProps {
  fields: Array<string>;
}

export const DeathInfoSection: React.FC<DeathInfoSectionProps> = ({ fields }) => {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext<FormValues>();
  const isDead = watch('isDead');
  const [deathDate, deathDateMeta] = useField('deathDate');
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
              onChange={(event, { checked, id }) => setValue(id, checked)}
            />
          </div>
        </Layer>
        {isDead ? fields.map((field) => <Field key={`death-info-${field}`} name={field} />) : null}
      </section>
    </section>
  );
};

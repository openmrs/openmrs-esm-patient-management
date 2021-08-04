import React from 'react';
import { Input } from '../../input/basic-input/input/input.component';
import { SelectInput } from '../../input/basic-input/select/select-input.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useTranslation } from 'react-i18next';
import styles from './../section.scss';

export interface DeathInfoSectionProps {
  id: 'death';
}

export const DeathInfoSection: React.FC<DeathInfoSectionProps> = () => {
  const { values } = React.useContext(PatientRegistrationContext);
  const { t } = useTranslation();

  return (
    <section className={styles.formSection} aria-label="Death Info Section">
      <h5 className={`omrs-type-title-5 ${styles.formSectionTitle}`}>Death Info</h5>
      <section className={styles.fieldGroup}>
        <Input labelText={t('isDeadInputLabel', 'Is Dead')} name="isDead" id="isDead" light />
        {values.isDead && (
          <>
            <Input labelText={t('deathDateInputLabel', 'Date of Death')} name="deathDate" id="deathDate" light />
            <SelectInput
              options={[t('unknown', 'Unknown'), t('stroke', 'Stroke')]}
              label={t('causeOfDeathInputLabel', 'Cause of Death')}
              name="deathCause"
            />
          </>
        )}
      </section>
    </section>
  );
};

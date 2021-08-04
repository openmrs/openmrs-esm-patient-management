import React, { useContext, useEffect } from 'react';
import styles from './../section.scss';
import { useField } from 'formik';
import { getField } from '../section-helper';
import { PatientRegistrationContext } from '../../patient-registration-context';

interface DemographicsSectionProps {
  fields: Array<any>;
}

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({ fields }) => {
  const [field, meta] = useField('addNameInLocalLanguage');
  const { setFieldValue } = useContext(PatientRegistrationContext);

  useEffect(() => {
    if (!field.value && meta.touched) {
      setFieldValue('additionalGivenName', '');
      setFieldValue('additionalMiddleName', '');
      setFieldValue('additionalFamilyName', '');
    }
  }, [field.value, meta.touched]);

  return (
    <section className={styles.formSection} aria-label="Demographics Section">
      {fields.map((field) => (
        <div key={field}>{getField(field)}</div>
      ))}
    </section>
  );
};

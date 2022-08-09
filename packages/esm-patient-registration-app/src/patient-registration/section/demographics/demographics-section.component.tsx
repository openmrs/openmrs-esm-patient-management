import React, { useContext, useEffect } from 'react';
import styles from './../section.scss';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Field } from '../../field/field.component';

export interface DemographicsSectionProps {
  fields: Array<string>;
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
  }, [field.value, meta.touched, setFieldValue]);

  return (
    <section className={styles.formSection} aria-label="Demographics Section">
      {fields.map((field) => (
        <Field key={`demographics-${field}`} name={field} />
      ))}
    </section>
  );
};

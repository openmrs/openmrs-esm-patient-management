import React, { useContext, useEffect } from 'react';
import styles from './../section.scss';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Field } from '../../field/field.component';
import { useFormContext } from 'react-hook-form';

export interface DemographicsSectionProps {
  fields: Array<string>;
}

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({ fields }) => {
  const [field, meta] = useField('addNameInLocalLanguage');
  const { setValue } = useFormContext();

  useEffect(() => {
    if (!field.value && meta.touched) {
      setValue('additionalGivenName', '');
      setValue('additionalMiddleName', '');
      setValue('additionalFamilyName', '');
    }
  }, [field.value, meta.touched]);

  return (
    <section className={styles.formSection} aria-label="Demographics Section">
      {fields.map((field) => (
        <Field key={`demographics-${field}`} name={field} />
      ))}
    </section>
  );
};

import React, { useContext, useEffect } from 'react';
import styles from './../section.scss';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Field } from '../../field/field.component';
import { useFormContext } from 'react-hook-form';
import { usePatientRegistrationContext } from '../../patient-registration-hooks';

export interface DemographicsSectionProps {
  fields: Array<string>;
}

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({ fields }) => {
  const { control, setValue, watch, getFieldState } = usePatientRegistrationContext();
  const addNameInLocalLanguageFieldName = 'addNameInLocalLanguage';
  const nameInLocalLanguage = watch(addNameInLocalLanguageFieldName);
  const isTouched = getFieldState(addNameInLocalLanguageFieldName);

  useEffect(() => {
    if (nameInLocalLanguage && isTouched) {
      setValue('additionalGivenName', '');
      setValue('additionalMiddleName', '');
      setValue('additionalFamilyName', '');
    }
  }, [nameInLocalLanguage, isTouched]);

  return (
    <section className={styles.formSection} aria-label="Demographics Section">
      {fields.map((field) => (
        <Field key={`demographics-${field}`} name={field} />
      ))}
    </section>
  );
};

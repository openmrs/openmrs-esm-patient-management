import React, { useEffect } from 'react';
import { useRegistrationField } from '../../form-adapter';
import { Field } from '../../field/field.component';
import { usePatientRegistrationContext } from '../../patient-registration-context';
import styles from './../section.scss';

export interface DemographicsSectionProps {
  fields: Array<string>;
}

export const DemographicsSection: React.FC<DemographicsSectionProps> = ({ fields }) => {
  const {
    field: { value: addNameInLocalLanguage },
    touched,
  } = useRegistrationField<boolean>('addNameInLocalLanguage');
  const { setFieldValue } = usePatientRegistrationContext();

  useEffect(() => {
    if (!addNameInLocalLanguage && touched) {
      setFieldValue('additionalGivenName', '');
      setFieldValue('additionalMiddleName', '');
      setFieldValue('additionalFamilyName', '');
    }
  }, [addNameInLocalLanguage, touched, setFieldValue]);

  return (
    <section className={styles.formSection} aria-label="Demographics Section">
      {fields.map((field) => (
        <Field key={`demographics-${field}`} name={field} />
      ))}
    </section>
  );
};

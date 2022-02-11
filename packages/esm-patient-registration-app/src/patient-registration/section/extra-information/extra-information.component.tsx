import React, { useContext, useEffect } from 'react';
import styles from './../section.scss';
import { useField } from 'formik';
import { getField } from '../section-helper';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import camelCase from 'lodash-es/camelCase';

export interface ExtraInformationSectionProps {
  id: 'extraInformation';
  fields: Array<any>;
}

export const ExtraInformationSection: React.FC<ExtraInformationSectionProps> = ({ fields }) => {
  const [field, meta] = useField('attributes');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { personAttributes } = useConfig();
  const { t } = useTranslation();

  useEffect(() => {
    if (!field.value && meta.touched) {
      setFieldValue('additionalGivenName', '');
      setFieldValue('additionalMiddleName', '');
      setFieldValue('additionalFamilyName', '');
    }
  }, [field.value, meta.touched]);

  return personAttributes?.length ? (
    <section className={styles.formSection} aria-label="Extra Information Section">
      {personAttributes
        ?.filter((personAttribute) => personAttribute.type === 'coded')
        .map((personAttribute, ind) => (
          <div key={ind} style={{ marginBottom: '1rem' }}>
            <Input
              id={`person-attribute-${personAttribute.uuid}`}
              labelText={t(personAttribute.name)}
              placeholder={t(personAttribute.name)}
              name={`attributes.${camelCase(personAttribute.name)}`}
              light
            />
          </div>
        ))}
    </section>
  ) : null;
};

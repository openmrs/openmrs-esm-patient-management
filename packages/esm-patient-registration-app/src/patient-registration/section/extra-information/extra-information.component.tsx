import React, { useContext, useEffect, useState } from 'react';
import styles from './../section.scss';
import { useField } from 'formik';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { PersonAttribute } from '../../patient-registration-types';
import { getConceptByUuid } from '../../patient-registration-utils';
import { Select, SelectItem } from 'carbon-components-react';

export interface ExtraInformationSectionProps {
  id: 'extraInformation';
  fields: Array<any>;
}

export const ExtraInformationSection: React.FC<ExtraInformationSectionProps> = ({ fields }) => {
  const [field, meta] = useField('attributes');
  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { personAttributes } = useConfig();

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
          <PersonAttributeField key={ind} index={ind} personAttribute={personAttribute} />
        ))}
    </section>
  ) : null;
};

interface PersonAttributeFieldProps {
  index: number;
  personAttribute: PersonAttribute;
}

const PersonAttributeField: React.FC<PersonAttributeFieldProps> = ({ index, personAttribute }) => {
  const [answers, setAnswers] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const abortController = new AbortController();
    if (personAttribute?.concept) {
      getConceptByUuid(personAttribute.concept, abortController).then((res) => setAnswers(res.data.answers));
    } else {
      setAnswers(null);
    }

    return () => abortController.abort();
  }, [index, personAttribute]);

  return (
    <div className={styles.attributeField}>
      {answers && answers.length ? (
        <Select
          id={`person-attribute-${personAttribute.uuid}`}
          name={`attributes.${personAttribute.uuid}`}
          labelText={t(personAttribute.name)}
          light>
          {answers.map((answer) => (
            <SelectItem value={answer.uuid} text={answer.display} />
          ))}
        </Select>
      ) : (
        <Input
          id={`person-attribute-${personAttribute.uuid}`}
          labelText={t(personAttribute.name)}
          placeholder={t(personAttribute.name)}
          name={`attributes.${personAttribute.uuid}`}
          light
        />
      )}
    </div>
  );
};

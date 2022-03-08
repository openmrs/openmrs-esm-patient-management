import React, { useEffect, useState } from 'react';
import styles from './../section.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { PersonAttribute } from '../../patient-registration-types';
import { getConceptByUuid } from '../../patient-registration-utils';
import { Select, SelectItem } from 'carbon-components-react';
import { usePersonAttributeType } from './extra-information.resource';
export interface ExtraInformationSectionProps {
  id: 'extraInformation';
  fields: Array<any>;
}

export const ExtraInformationSection: React.FC<ExtraInformationSectionProps> = () => {
  const { personAttributes } = useConfig();

  return personAttributes?.length ? (
    <section className={styles.formSection} aria-label="Extra Information Section">
      {personAttributes
        ?.filter((personAttribute) => personAttribute.type === 'coded')
        .map((personAttribute: PersonAttribute, ind) => (
          <PersonAttributeField
            key={ind}
            index={ind}
            personAttributeTypeUuid={personAttribute.uuid}
            conceptUuid={personAttribute.concept}
          />
        ))}
    </section>
  ) : null;
};

interface PersonAttributeFieldProps {
  index: number;
  personAttributeTypeUuid: string;
  conceptUuid: string;
}

const PersonAttributeField: React.FC<PersonAttributeFieldProps> = ({ index, personAttributeTypeUuid, conceptUuid }) => {
  const { data: personAttributeType, isLoading } = usePersonAttributeType(personAttributeTypeUuid);
  const [answers, setAnswers] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const abortController = new AbortController();
    if (conceptUuid) {
      getConceptByUuid(conceptUuid, abortController).then((res) => setAnswers(res.data.answers));
    } else {
      setAnswers(null);
    }

    return () => abortController.abort();
  }, [index, conceptUuid]);

  return !isLoading ? (
    <div className={styles.attributeField}>
      {answers && answers.length ? (
        <Select
          id={`person-attribute-${personAttributeTypeUuid}`}
          name={`attributes.${personAttributeTypeUuid}`}
          labelText={personAttributeType?.name}
          light>
          {answers.map((answer) => (
            <SelectItem key={answer.uuid} value={answer.uuid} text={answer.display} />
          ))}
        </Select>
      ) : (
        <Input
          id={`person-attribute-${personAttributeTypeUuid}`}
          labelText={personAttributeType?.name}
          placeholder={personAttributeType?.name}
          name={`attributes.${personAttributeTypeUuid}`}
          light
        />
      )}
    </div>
  ) : null;
};

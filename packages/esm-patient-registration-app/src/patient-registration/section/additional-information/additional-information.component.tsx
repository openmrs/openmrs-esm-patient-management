import React from 'react';
import styles from './../section.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useConfig } from '@openmrs/esm-framework';
import { PersonAttribute } from '../../patient-registration-types';
import { Select, SelectItem } from 'carbon-components-react';
import { useConceptAnswers, usePersonAttributeType } from './additional-information.resource';

export interface AdditionalInformationSectionProps {
  id: 'extraInformation';
  fields: Array<any>;
}

export const AdditionalInformationSection: React.FC<AdditionalInformationSectionProps> = () => {
  const { personAttributes } = useConfig();

  return personAttributes?.length ? (
    <section className={styles.formSection} aria-label="Additional Information Section">
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
  const [personAttributeType, isLoading] = usePersonAttributeType(personAttributeTypeUuid);
  const [conceptAnswers, isLoadingConceptAnswers] = useConceptAnswers(conceptUuid);

  return !isLoading ? (
    <div className={styles.attributeField}>
      {!isLoadingConceptAnswers && conceptAnswers?.length ? (
        <Select
          id={`person-attribute-${personAttributeTypeUuid}`}
          name={`attributes.${personAttributeTypeUuid}`}
          labelText={personAttributeType?.name}
          light>
          {conceptAnswers.map((answer) => (
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

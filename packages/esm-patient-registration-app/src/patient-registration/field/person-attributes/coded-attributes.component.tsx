import React from 'react';
import styles from './../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useConfig } from '@openmrs/esm-framework';
import { PersonAttributeTypeConfig } from '../../patient-registration-types';
import { Select, SelectItem } from 'carbon-components-react';
import { useConceptAnswers, usePersonAttributeType } from './person-attributes.resource';

export interface CodedAttributesFieldProps {}

export const CodedAttributesField: React.FC<CodedAttributesFieldProps> = () => {
  const { personAttributeTypes } = useConfig();

  return personAttributeTypes?.length ? (
    <div>
      {personAttributeTypes
        ?.filter((personAttributeType) => personAttributeType.type === 'coded')
        .map((personAttributeType: PersonAttributeTypeConfig, ind) => (
          <PersonAttributeField
            key={ind}
            personAttributeTypeUuid={personAttributeType.uuid}
            conceptUuid={personAttributeType.concept}
          />
        ))}
    </div>
  ) : null;
};

interface PersonAttributeFieldProps {
  personAttributeTypeUuid: string;
  conceptUuid: string;
}

const PersonAttributeField: React.FC<PersonAttributeFieldProps> = ({ personAttributeTypeUuid, conceptUuid }) => {
  const { data: personAttributeType, isLoading } = usePersonAttributeType(personAttributeTypeUuid);
  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(conceptUuid);

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

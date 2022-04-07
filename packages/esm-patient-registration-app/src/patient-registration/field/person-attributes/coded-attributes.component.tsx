import React from 'react';
import styles from './../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useConfig } from '@openmrs/esm-framework';
import { CodedPersonAttributeConfig } from '../../patient-registration-types';
import { Select, SelectItem } from 'carbon-components-react';
import { useConceptAnswers, usePersonAttributeType } from './person-attributes.resource';

export interface CodedAttributesFieldProps {}

export const CodedAttributesField: React.FC<CodedAttributesFieldProps> = () => {
  const { codedPersonAttributes } = useConfig();

  return codedPersonAttributes?.length ? (
    <div>
      {codedPersonAttributes.map((personAttributeType: CodedPersonAttributeConfig, ind) => (
        <PersonAttributeField
          key={ind}
          personAttributeTypeUuid={personAttributeType.personAttributeUuid}
          conceptUuid={personAttributeType.conceptUuid}
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
    <div className={`${styles.attributeField} ${styles.halfWidthInDesktopView}`}>
      {!isLoadingConceptAnswers && conceptAnswers?.length ? (
        <Select
          id={`person-attribute-${personAttributeTypeUuid}`}
          name={`attributes.${personAttributeTypeUuid}`}
          labelText={personAttributeType?.display}
          light>
          {conceptAnswers.map((answer) => (
            <SelectItem key={answer.uuid} value={answer.uuid} text={answer.display} />
          ))}
        </Select>
      ) : (
        <Input
          id={`person-attribute-${personAttributeTypeUuid}`}
          labelText={personAttributeType?.display}
          name={`attributes.${personAttributeTypeUuid}`}
          light
        />
      )}
    </div>
  ) : null;
};

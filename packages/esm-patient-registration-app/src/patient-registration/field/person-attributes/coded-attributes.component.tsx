import React from 'react';
import { Layer, Select, SelectItem } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { Input } from '../../input/basic-input/input/input.component';
import { CodedPersonAttributeConfig } from '../../patient-registration.types';
import { useConceptAnswers } from '../field.resource';
import { usePersonAttributeType } from './person-attributes.resource';
import styles from './../field.scss';

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
        <Layer>
          <Select
            id={`person-attribute-${personAttributeTypeUuid}`}
            name={`attributes.${personAttributeTypeUuid}`}
            labelText={personAttributeType?.display}>
            {conceptAnswers.map((answer) => (
              <SelectItem key={answer.uuid} value={answer.uuid} text={answer.display} />
            ))}
          </Select>
        </Layer>
      ) : (
        <Input
          id={`person-attribute-${personAttributeTypeUuid}`}
          labelText={personAttributeType?.display}
          name={`attributes.${personAttributeTypeUuid}`}
        />
      )}
    </div>
  ) : null;
};

import React from 'react';
import styles from './../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { Select, SelectItem } from 'carbon-components-react';
import { useConceptAnswers } from './person-attributes.resource';
import { PersonAttributeTypeResponse } from '../../patient-registration-types';

export interface CodedPersonAttributeFieldProps {
  personAttributeType: PersonAttributeTypeResponse;
  conceptUuid: string;
}

export function CodedPersonAttributeField({ personAttributeType, conceptUuid }: CodedPersonAttributeFieldProps) {
  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(conceptUuid);

  return (
    <div className={`${styles.attributeField} ${styles.halfWidthInDesktopView}`}>
      {!isLoadingConceptAnswers && conceptAnswers?.length ? (
        <Select
          id={`person-attribute-${personAttributeType.uuid}`}
          name={`attributes.${personAttributeType.uuid}`}
          labelText={personAttributeType?.display}
          light>
          {conceptAnswers.map((answer) => (
            <SelectItem key={answer.uuid} value={answer.uuid} text={answer.display} />
          ))}
        </Select>
      ) : (
        <Input
          id={`person-attribute-${personAttributeType.uuid}`}
          labelText={personAttributeType?.display}
          name={`attributes.${personAttributeType.uuid}`}
          light
        />
      )}
    </div>
  );
}

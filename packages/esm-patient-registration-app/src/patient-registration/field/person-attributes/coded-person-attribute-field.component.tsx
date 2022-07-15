import React from 'react';
import { Layer, Select, SelectItem } from '@carbon/react';
import { Input } from '../../input/basic-input/input/input.component';
import { PersonAttributeTypeResponse } from '../../patient-registration-types';
import { useConceptAnswers } from '../field.resource';
import styles from './../field.scss';

export interface CodedPersonAttributeFieldProps {
  personAttributeType: PersonAttributeTypeResponse;
  answerConceptSetUuid: string;
  label?: string;
}

export function CodedPersonAttributeField({
  personAttributeType,
  answerConceptSetUuid,
  label,
}: CodedPersonAttributeFieldProps) {
  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(answerConceptSetUuid);

  return (
    <div className={`${styles.customField} ${styles.halfWidthInDesktopView}`}>
      {!isLoadingConceptAnswers && conceptAnswers?.length ? (
        <Layer>
          <Select
            id={`person-attribute-${personAttributeType.uuid}`}
            name={`attributes.${personAttributeType.uuid}`}
            labelText={label ?? personAttributeType?.display}>
            <SelectItem value="" text="" />
            {conceptAnswers.map((answer) => (
              <SelectItem key={answer.uuid} value={answer.uuid} text={answer.display} />
            ))}
          </Select>
        </Layer>
      ) : (
        <Input
          id={`person-attribute-${personAttributeType.uuid}`}
          labelText={label ?? personAttributeType?.display}
          name={`attributes.${personAttributeType.uuid}`}
        />
      )}
    </div>
  );
}

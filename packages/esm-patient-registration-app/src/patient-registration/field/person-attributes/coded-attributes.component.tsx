import React from 'react';
import { Input } from '../../input/basic-input/input/input.component';
import { useConfig } from '@openmrs/esm-framework';
import { CodedPersonAttributeConfig } from '../../patient-registration-types';
import { Select, SelectItem } from 'carbon-components-react';
import { useConceptAnswers, usePersonAttributeType } from './person-attributes.resource';
import { useTranslation } from 'react-i18next';
import { PersonAttributeField } from './person-attribute-field.component';

export interface CodedAttributesFieldProps {}

export const CodedAttributesField: React.FC<CodedAttributesFieldProps> = () => {
  const { codedPersonAttributes } = useConfig();

  return codedPersonAttributes?.length ? (
    <div>
      {codedPersonAttributes.map((personAttributeType: CodedPersonAttributeConfig, ind) => (
        <CodedPersonAttributeField
          key={ind}
          personAttributeTypeUuid={personAttributeType.personAttributeUuid}
          conceptUuid={personAttributeType.conceptUuid}
        />
      ))}
    </div>
  ) : null;
};

interface CodedPersonAttributeFieldProps {
  personAttributeTypeUuid: string;
  conceptUuid: string;
}

export const CodedPersonAttributeField: React.FC<CodedPersonAttributeFieldProps> = ({
  personAttributeTypeUuid,
  conceptUuid,
}) => {
  const { data: personAttributeType, isLoading } = usePersonAttributeType(personAttributeTypeUuid);
  const { data: conceptAnswers, isLoading: isLoadingConceptAnswers } = useConceptAnswers(conceptUuid);
  const { t } = useTranslation();
  const inputField = (
    <>
      {!isLoadingConceptAnswers && conceptAnswers?.length ? (
        <Select
          id={`person-attribute-${personAttributeTypeUuid}`}
          labelText={`${personAttributeType?.name} (${t('optional', 'optional')})`}
          light
          name={`attributes.${personAttributeTypeUuid}.value`}>
          {conceptAnswers.map((answer) => (
            <SelectItem key={answer.uuid} value={answer.uuid} text={answer.display} />
          ))}
        </Select>
      ) : (
        <Input
          id={`person-attribute-${personAttributeTypeUuid}`}
          labelText={`${personAttributeType?.name} (${t('optional', 'optional')})`}
          placeholder={''}
          light
          name={`attributes.${personAttributeTypeUuid}.value`}
        />
      )}
    </>
  );

  return (
    <PersonAttributeField
      isLoadingPersonAttributeTypeDetails={isLoading}
      personAttributeTypeUuid={personAttributeTypeUuid}
      personAttributeTypeName={personAttributeType?.name}
      inputField={inputField}
    />
  );
};

import React from 'react';
import { DemographicsSection } from './demographics/demographics-section.component';
import { RelationshipsSection } from './patient-relationships/relationships-section.component';
import { DeathInfoSection } from './death-info/death-info-section.component';
import { SectionWrapper } from './section-wrapper.component';
import { AddressField } from '../field/address/address-field.component';
import { NameField } from '../field/name/name-field.component';
import { SexField } from '../field/sex/sex-field.component';
import { IdField } from '../field/id/id-field.component';
import { DobField } from '../field/dob/dob.component';
import { PersonAttributeField } from '../field/person-attributes/person-attribute-field.component';
import { DefaultRegistrationSection } from './registration-section.component';

export function getField(fieldName: string, fieldConfig: Record<string, any>) {
  switch (fieldName) {
    case 'address':
      return <AddressField />;
    case 'name':
      return <NameField />;
    case 'sex':
      return <SexField />;
    case 'dob':
      return <DobField />;
    case 'id':
      return <IdField />;
    default:
      if (fieldConfig && fieldConfig.uuid) {
        return (
          <PersonAttributeField
            personAttributeTypeUuid={fieldConfig.uuid}
            conceptUuid={fieldConfig.conceptUuid}
            validation={fieldConfig.validation}
            placeholder={fieldConfig.placeholder}
          />
        );
      } else {
        return <div>Unknown Field {fieldName} </div>;
      }
  }
}

function renderSection(sectionProps: SectionProps) {
  switch (sectionProps.id) {
    case 'demographics':
      return <DemographicsSection {...sectionProps} />;
    case 'death':
      return <DeathInfoSection {...sectionProps} />;
    case 'relationships':
      return <RelationshipsSection {...sectionProps} />;
    default:
      return <DefaultRegistrationSection {...sectionProps} />;
  }
}

export type SectionProps = {
  id: string;
  fieldSections?: Array<{ name: string; fields?: Array<string> }>;
  ariaLabel?: string;
};

export function getSection(sectionProps: SectionProps & { name: string }, index: number) {
  return (
    <SectionWrapper {...sectionProps} index={index}>
      {renderSection(sectionProps)}
    </SectionWrapper>
  );
}

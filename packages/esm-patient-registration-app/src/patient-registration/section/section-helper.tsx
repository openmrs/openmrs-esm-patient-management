import React from 'react';
import { DemographicsSection, DemographicsSectionProps } from './demographics/demographics-section.component';
import { ContactInfoSection, ContactInfoSectionProps } from './contact-info/contact-info-section.component';
import {
  RelationshipsSection,
  RelationshipsSectionProps,
} from './patient-relationships/relationships-section.component';
import { DeathInfoSection, DeathInfoSectionProps } from './death-info/death-info-section.component';
import { SectionWrapper } from './section-wrapper.component';
import { AddressField } from '../field/address/address-field.component';
import { PhoneEmailField } from '../field/email/email-field.component';
import { NameField } from '../field/name/name-field.component';
import GenderField from '../field/gender/gender-field.component';
import { IdField } from '../field/id/id-field.component';
import {
  AdditionalInformationSection,
  AdditionalInformationSectionProps,
} from './additional-information/additional-information.component';
import { DobField } from '../field/dob/dob.component';
import { CodedAttributesField } from '../field/person-attributes/coded-attributes.component';
import { TextBasedAttributesField } from '../field/person-attributes/text-based-attributes-field.component';

export function getField(fieldName: string) {
  switch (fieldName) {
    case 'address':
      return <AddressField />;
    case 'phone & email':
      return <PhoneEmailField />;
    case 'name':
      return <NameField />;
    case 'gender':
      return <GenderField />;
    case 'dob':
      return <DobField />;
    case 'id':
      return <IdField />;
    case 'codedAttributes':
      return <CodedAttributesField />;
    case 'textBasedAttributes':
      return <TextBasedAttributesField />;
    default:
      return <div>Unknown Field {fieldName} </div>;
  }
}

function renderSection(sectionProps: SectionProps) {
  switch (sectionProps.id) {
    case 'demographics':
      return <DemographicsSection {...sectionProps} />;
    case 'contact':
      return <ContactInfoSection {...sectionProps} />;
    case 'death':
      return <DeathInfoSection {...sectionProps} />;
    case 'relationships':
      return <RelationshipsSection {...sectionProps} />;
    case 'additionalInformation':
      return <AdditionalInformationSection {...sectionProps} />;
    default:
      return <div>Unknown Section {sectionProps.id}</div>;
  }
}

export interface DefaultSectionProps {
  id: 'default';
}

export type SectionProps =
  | DemographicsSectionProps
  | ContactInfoSectionProps
  | DeathInfoSectionProps
  | RelationshipsSectionProps
  | AdditionalInformationSectionProps
  | DefaultSectionProps;

export function getSection(sectionProps: SectionProps & { name: string }, index: number) {
  return (
    <SectionWrapper {...sectionProps} index={index}>
      {renderSection(sectionProps)}
    </SectionWrapper>
  );
}

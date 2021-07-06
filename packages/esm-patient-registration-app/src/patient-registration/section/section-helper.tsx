import React, { SetStateAction } from 'react';
import { Row, Column } from 'carbon-components-react/es/components/Grid';
import { DemographicsSection } from './demographics/demographics-section.component';
import { ContactInfoSection } from './contact-info/contact-info-section.component';
import { RelationshipsSection } from './patient-relationships/relationships-section.component';
import { DeathInfoSection } from './death-info/death-info-section.component';
import { SectionWrapper } from './section-wrapper.component';
import { AddressField } from '../field/address/address-field.component';
import { PhoneEmailField } from '../field/email/email-field.component';
import { PhoneField } from '../field/phone/phone-field.component';
import { NameField } from '../field/name/name-field.component';
import { GenderBirthField } from '../field/gender/gender-field.component';
import { IdField } from '../field/id/id-field.component';
import { DobField } from '../field/dob/dob.component';
import { CapturePhotoProps } from '../patient-registration-types';

enum Field {
  Address = 'address',
  PhoneEmail = 'phone & email',
  Name = 'name',
  Id = 'id',
  GenderBirth = 'gender & dob',
  Default = 'default',
}

enum Section {
  Demographics = 'demographics',
  Contact = 'contact',
  Death = 'death',
  Relationships = 'relationships',
  Default = 'default',
}

export const getField = (fieldName: string) => {
  switch (fieldName) {
    case Field.Address:
      return <AddressField />;
    case Field.PhoneEmail:
      return <PhoneEmailField />;
    case Field.Name:
      return <NameField />;
    case Field.GenderBirth:
      return <GenderBirthField />;
    case Field.Id:
      return <IdField />;
    case Field.Default:
      return <div>Unknown Field {fieldName} </div>;
  }
};

export const getSection = (sectionProps: any, index: number) => {
  let section = null;
  switch (sectionProps.id) {
    case Section.Demographics:
      section = <DemographicsSection {...sectionProps} />;
      break;
    case Section.Contact:
      section = <ContactInfoSection {...sectionProps} />;
      break;
    case Section.Death:
      section = <DeathInfoSection {...sectionProps} />;
      break;
    case Section.Relationships:
      section = <RelationshipsSection {...sectionProps} />;
      break;
    case Section.Default:
    default:
      section = <div>Unknown Section {sectionProps.id}</div>;
      break;
  }

  return (
    <SectionWrapper {...sectionProps} index={index}>
      {section}
    </SectionWrapper>
  );
};

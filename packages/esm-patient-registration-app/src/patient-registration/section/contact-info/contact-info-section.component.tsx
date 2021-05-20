import React from 'react';
import { getField } from '../section-helper';

interface ContactInfoSectionProps {
  fields: Array<string>;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ fields }) => {
  return (
    <section aria-label="Contact Info Section">
      {fields.map((fieldName) => (
        <div key={fieldName}>{getField(fieldName)}</div>
      ))}
    </section>
  );
};

import React from 'react';
import styles from './../section.scss';
import { getField } from '../section-helper';
export interface AdditionalInformationSectionProps {
  id: 'additionalInformation';
  fields: Array<any>;
}

export const AdditionalInformationSection: React.FC<AdditionalInformationSectionProps> = ({ fields }) => {
  return (
    <section className={styles.formSection} aria-label="Additional Information Section">
      {fields.map((field) => (
        <div key={field}>{getField(field)}</div>
      ))}
    </section>
  );
};

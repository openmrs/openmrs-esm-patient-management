import React from 'react';
import { type SectionDefinition } from '../../config-schema';
import { Field } from '../field/field.component';

export interface GenericSectionProps {
  sectionDefinition: SectionDefinition;

  fieldRenderer?: (fieldName: string) => React.ReactNode;
}

export const GenericSection = ({ sectionDefinition, fieldRenderer }: GenericSectionProps) => {
  return (
    <section aria-label={`${sectionDefinition.name} Section`}>
      {sectionDefinition.fields.map((name) =>
        fieldRenderer ? (
          <React.Fragment key={`${sectionDefinition.name}-${name}`}>{fieldRenderer(name)}</React.Fragment>
        ) : (
          <Field key={`${sectionDefinition.name}-${name}`} name={name} />
        ),
      )}
    </section>
  );
};

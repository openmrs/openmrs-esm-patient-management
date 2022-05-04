import React from 'react';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash-es/capitalize';
import { useConfig } from '@openmrs/esm-framework';
import styles from './section.scss';
import { getField, SectionProps } from './section-helper';

export const FieldSections: React.FC<Pick<SectionProps, 'id' | 'fieldSections'>> = ({ id, fieldSections }) => {
  const { fieldDefinitions } = useConfig();
  const { t } = useTranslation();

  return (
    <>
      {fieldSections?.map((fieldSection, idx) => (
        <div key={`${id}-${idx}`}>
          {fieldSection.name ? <h4 className={styles.productiveHeading02Light}>{t(fieldSection.name)}</h4> : undefined}
          <div className={styles.grid}>
            {fieldSection.fields?.map((field) => (
              <div key={`${id}-${field}`}>
                {getField(field, field in fieldDefinitions ? fieldDefinitions[field] : undefined)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export const DefaultRegistrationSection: React.FC<SectionProps> = ({ id, fieldSections, ariaLabel }) => {
  return (
    <section className={styles.formSection} aria-label={ariaLabel ?? `${capitalize(id)} Section`}>
      <FieldSections id={id} fieldSections={fieldSections} />
    </section>
  );
};

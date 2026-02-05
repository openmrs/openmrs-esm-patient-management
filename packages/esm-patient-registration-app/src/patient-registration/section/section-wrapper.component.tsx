import React from 'react';
import { Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type SectionDefinition } from '../../config-schema';
import { Section } from './section.component';
import styles from './section.scss';

export interface SectionWrapperProps {
  sectionDefinition: SectionDefinition;
  index: number;
  fieldRenderer?: (fieldName: string) => React.ReactNode;
}

export const SectionWrapper = ({ sectionDefinition, index, fieldRenderer }: SectionWrapperProps) => {
  const { t } = useTranslation();

  return (
    <div id={sectionDefinition.id} style={{ scrollMarginTop: '4rem' }}>
      <h3 className={styles.productiveHeading02} style={{ color: '#161616' }}>
        {index + 1}. {t(`${sectionDefinition.id}Section`, sectionDefinition.name)}
      </h3>
      <span className={styles.label01}>
        {t('allFieldsRequiredText', 'All fields are required unless marked optional')}
      </span>
      <div style={{ margin: '1rem 0 1rem' }}>
        <Tile>
          <Section sectionDefinition={sectionDefinition} fieldRenderer={fieldRenderer} />
        </Tile>
      </div>
    </div>
  );
};

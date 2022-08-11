import React from 'react';
import styles from '../patient-registration.scss';
import { Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { SectionDefinition } from '../../config-schema';
import { Section } from './section.component';

export interface SectionWrapperProps {
  sectionDefinition: SectionDefinition;
  index: number;
}

export const SectionWrapper = ({ sectionDefinition, index }: SectionWrapperProps) => {
  const { t } = useTranslation();

  return (
    <div id={sectionDefinition.id}>
      <h3 className={styles.productiveHeading02} style={{ color: '#161616' }}>
        {index + 1}. {sectionDefinition.name}
      </h3>
      <span className={styles.label01}>
        {t('allFieldsRequiredText', 'All fields are required unless marked optional')}
      </span>
      <div style={{ margin: '1rem 0 1rem' }}>
        <Tile>
          <Section sectionDefinition={sectionDefinition} />
        </Tile>
      </div>
    </div>
  );
};

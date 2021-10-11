import React from 'react';
import styles from '../patient-registration.scss';
import { Tile } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';

export const SectionWrapper = ({ id, children, name, index }) => {
  const { t } = useTranslation();
  return (
    <div id={id}>
      <h3 className={styles.productiveHeading02} style={{ color: '#161616' }}>
        {index + 1}. {name}
      </h3>
      <span className={styles.label01}>
        {t('allFieldsRequiredText', 'All fields are required unless marked optional')}
      </span>
      <div style={{ margin: '1rem 0 1rem' }}>
        <Tile>{children}</Tile>
      </div>
    </div>
  );
};

import { Tag } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ward-bed.scss';

const BedShareDivider = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.bedDivider}>
      <div className={styles.bedDividerLine}></div>
      <Tag>{t('bedShare', 'Bed share')}</Tag>
      <div className={styles.bedDividerLine}></div>
    </div>
  );
};

export default BedShareDivider;

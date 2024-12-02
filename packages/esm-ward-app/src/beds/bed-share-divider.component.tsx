import { SkeletonText, Tag } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './bed-share-divider.scss';

interface BedShareDividerProps {
  isLoading?: boolean;
}

const BedShareDivider: React.FC<BedShareDividerProps> = ({ isLoading }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.bedDivider}>
      <div className={styles.bedDividerLine}></div>
      {isLoading ? <SkeletonText /> : <Tag>{t('bedShare', 'Bed share')}</Tag>}
      <div className={styles.bedDividerLine}></div>
    </div>
  );
};

export default BedShareDivider;

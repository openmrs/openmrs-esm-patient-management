import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyDataIllustration } from '../empty-state/empty-data-illustration.component';
import styles from './coming-soon.scss';

const ComingSoon: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('comingSoon', 'Coming soon')}</h2>
      <EmptyDataIllustration />
      <h3 className={styles.subTitle}>{t('underDevelopement', 'Under development')}</h3>
    </div>
  );
};

export default ComingSoon;

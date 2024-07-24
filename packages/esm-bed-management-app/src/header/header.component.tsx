import React from 'react';
import { ConfigurableLink, formatDate, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import Illustration from './illustration.component';
import styles from './header.scss';

type HeaderProps = {
  route: string;
  headerTitle?: string;
};

const Header: React.FC<HeaderProps> = ({ route, headerTitle = 'Bed Management' }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles['left-justified-items']}>
        <ConfigurableLink to={`${window.getOpenmrsSpaBase()}bed-management`}>
          <Illustration />
        </ConfigurableLink>
        <div className={styles['page-labels']}>
          <p>{t('headerTitle', headerTitle)}</p>
          <p className={styles['page-name']}>{route}</p>
        </div>
      </div>
      <div className={styles['right-justified-items']}>
        <div className={styles['date-and-location']}>
          <Location size={16} />
          <span className={styles.value}>{userLocation}</span>
          <span className={styles.middot}>&middot;</span>
          <Calendar size={16} />
          <span className={styles.value}>{formatDate(new Date(), { mode: 'standard' })}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;

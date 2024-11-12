import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Location } from '@carbon/react/icons';
import { ConfigurableLink, formatDate, useSession } from '@openmrs/esm-framework';
import Illustration from './illustration.component';
import styles from './header.scss';

type HeaderProps = {
  route: string;
  headerTitle?: string;
};

const Header: React.FC<HeaderProps> = ({ route, headerTitle }) => {
  const { t } = useTranslation();
  const userSession = useSession();
  const userLocation = userSession?.sessionLocation?.display;

  return (
    <div className={styles.header}>
      <div className={styles.leftJustifiedItems}>
        <ConfigurableLink to={`${window.getOpenmrsSpaBase()}bed-management`}>
          <Illustration />
        </ConfigurableLink>
        <div className={styles.pageLabels}>
          <p>{t(headerTitle ?? 'bedManagement', headerTitle ?? 'Bed management')}</p>
          <p className={styles.pageName}>{route}</p>
        </div>
      </div>
      <div className={styles.rightJustifiedItems}>
        <div className={styles.dateAndLocation}>
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

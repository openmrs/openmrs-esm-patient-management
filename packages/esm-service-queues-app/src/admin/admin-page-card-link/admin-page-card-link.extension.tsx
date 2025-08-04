import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRightIcon } from '@openmrs/esm-framework';
import styles from './admin-page-card-link.scss';

const AdminPageCardLink: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layer>
      <a className={styles.cardLink} href={`${window.spaBase}/home/service-queues/admin`}>
        <ClickableTile>
          <div>
            <div className="heading">{t('manageServiceQueues', 'Manage Service Queues')}</div>
            <div className="content">{t('serviceQueuesAdmin', 'Service Queues Admin')}</div>
          </div>
          <div className="iconWrapper">
            <ArrowRightIcon size={16} />
          </div>
        </ClickableTile>
      </a>
    </Layer>
  );
};

export default AdminPageCardLink;

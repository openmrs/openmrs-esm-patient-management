import { SideNavMenu, SideNavMenuItem } from '@carbon/react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type Queue } from '../types';
import { useQueues } from '../hooks/useQueues';
import classNames from 'classnames';
import { BrowserRouter, useLocation } from 'react-router-dom';
import styles from './queue-table-by-status-menu.scss';

function QueueTableLink({ basePath, queue }: { basePath: string; queue: Queue }) {
  const location = useLocation();
  const pageUrl = basePath + '/' + queue.uuid;
  const selected = location.pathname.startsWith(pageUrl);
  return (
    <ConfigurableLink
      className={classNames('cds--side-nav__link', {
        'active-left-nav-link': selected,
      })}
      to={`${basePath}/${queue.uuid}`}>
      {queue.display}
    </ConfigurableLink>
  );
}

export default function QueueTableByStatusMenu() {
  const { t } = useTranslation();
  const { queues } = useQueues();
  const basePath = `${window.spaBase}/home/service-queues/queue-table-by-status`; // TODO: Configure elsewhere?
  return (
    <SideNavMenu
      defaultExpanded={true}
      title={t('serviceQueues', 'Service Queues')}
      className={styles.queueTableByStatusNavMenu}>
      <BrowserRouter>
        {queues.map((queue) => (
          <QueueTableLink basePath={basePath} queue={queue} />
        ))}
      </BrowserRouter>
    </SideNavMenu>
  );
}

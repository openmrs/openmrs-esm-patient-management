import { SideNavMenu } from '@carbon/react';
import { ConfigurableLink } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type Queue } from '../types';
import { useQueues } from '../hooks/useQueues';
import classNames from 'classnames';
import { BrowserRouter, useMatch, generatePath } from 'react-router-dom';
import styles from './queue-table-by-status-menu.scss';

// (Non-standard UI) A menu in the left nav to display a list of queues. Intended to be used
// by slotting into the left nav as an extension
export default function QueueTableByStatusMenu() {
  const { t } = useTranslation();
  const { queues } = useQueues();

  return (
    <SideNavMenu title={t('serviceQueues', 'Service queues')} className={styles.queueTableByStatusNavMenu}>
      <BrowserRouter>
        {queues.map((queue) => (
          <QueueTableByStatusLink queue={queue} />
        ))}
      </BrowserRouter>
    </SideNavMenu>
  );
}

function QueueTableByStatusLink({ queue }: { queue: Queue }) {
  const path = `${window.spaBase}/home/service-queues/queue-table-by-status/:uuid`;
  const matcher = useMatch({ path, end: false });
  const uuid = matcher?.params?.uuid;

  return (
    <ConfigurableLink
      className={classNames('cds--side-nav__link', {
        'active-left-nav-link': queue.uuid == uuid,
      })}
      to={generatePath(path, { uuid: queue.uuid })}>
      {queue.display}
    </ConfigurableLink>
  );
}

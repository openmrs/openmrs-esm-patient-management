import { SideNavMenu, SideNavMenuItem } from '@carbon/react';
import { useSession } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueues } from '../hooks/useQueues';

interface QueueTableByStatusMenuProps {
  locationUuid: string;
}

export default function QueueTableByStatusMenu({ locationUuid }: QueueTableByStatusMenuProps) {
  const { t } = useTranslation();
  const { sessionLocation } = useSession();
  const { queues } = useQueues();

  return (
    <SideNavMenu defaultExpanded={true} title={t('serviceQueues', 'Service Queues')}>
      {queues.map((queue) => (
        <SideNavMenuItem key={queue.uuid} href={`home/service-queues/queue-table-by-status/${queue.uuid}`}>
          {queue.display}
        </SideNavMenuItem>
      ))}
    </SideNavMenu>
  );
}

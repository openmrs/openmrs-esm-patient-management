import React from 'react';
import { ActionableNotification } from '@carbon/react';
import { useActionableNotification } from '../../hooks/useActionableNotification';

import styles from './notification.component.scss';

const Notification: React.FC = () => {
  const { showNotification, notification = {} } = useActionableNotification();
  const { actionButtonLabel, onActionButtonClick = () => {}, subtitle, kind, title, critical } = notification;

  return (
    showNotification && (
      <ActionableNotification
        className={styles.actionableNotification}
        kind={kind || 'info'}
        actionButtonLabel={actionButtonLabel || 'Undoing'}
        ariaLabel="closes notification"
        onActionButtonClick={onActionButtonClick}
        onClose={function noRefCheck() {}}
        onCloseButtonClick={function noRefCheck() {}}
        statusIconDescription="notification"
        subtitle={subtitle}
        title={title}
        lowContrast={critical}
        inline={true}
      />
    )
  );
};

export default Notification;

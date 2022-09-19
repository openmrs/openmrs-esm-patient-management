import { getGlobalStore } from '@openmrs/esm-framework';
import { useEffect, useState } from 'react';

export interface NotificationDescriptor {
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  onClose?: () => void;
  subtitle?: string;
  title: string;
  kind?: ActionableNotificationType | string;
  critical?: boolean;
}

export type ActionableNotificationType = 'error' | 'info' | 'info-square' | 'success' | 'warning' | 'warning-alt';

interface ActionableNotificationStore {
  showNotification: boolean;
  notification?: NotificationDescriptor | any;
}

const initialState = { showNotification: false, notification: {} };

const getActionableNotificationStore = () => {
  return getGlobalStore('home-appointment-store', initialState);
};

export const showActionableNotification = (notification) => {
  const store = getActionableNotificationStore();
  store.setState({ showNotification: true, notification });
};

export const onClickUndo = () => {
  const store = getActionableNotificationStore();
  store.setState({
    showNotification: true,
    notification: { kind: 'success', title: 'Undoing status...', critical: true },
  });
};

export const closeActionableNotification = () => {
  const store = getActionableNotificationStore();
  store.setState({ notification: {}, showNotification: false });
};

export const useActionableNotification = () => {
  const [notification, setNotification] = useState<ActionableNotificationStore>();

  useEffect(() => {
    function update(state: ActionableNotificationStore) {
      setNotification(state);
    }
    update(getActionableNotificationStore().getState());
    getActionableNotificationStore().subscribe(update);
  }, []);

  return {
    showNotification: notification?.showNotification,
    notification: notification?.notification,
  };
};

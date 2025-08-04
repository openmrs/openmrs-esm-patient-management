import React, { useCallback } from 'react';
import { Button } from '@carbon/react';
import { launchWorkspace, showModal, useLayoutType, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const AdminPage = () => {
  const { t } = useTranslation();
  const currentUserSession = useSession();
  const providerUuid = currentUserSession?.currentProvider?.uuid;

  const launchAddProviderToRoomModal = useCallback(() => {
    const dispose = showModal('add-provider-to-room-modal', {
      closeModal: () => dispose(),
      providerUuid,
    });
  }, [providerUuid]);

  return (
    <div>
      <Button onClick={() => launchWorkspace('service-queues-service-form')}>
        {t('addNewService', 'Add new service')}
      </Button>
      <Button onClick={() => launchWorkspace('service-queues-room-workspace')}>
        {t('addNewServiceRoom', 'Add new service room')}
      </Button>
      <Button onClick={launchAddProviderToRoomModal}>{t('addProviderQueueRoom', 'Add provider queue room')}</Button>
    </div>
  );
};

export default AdminPage;

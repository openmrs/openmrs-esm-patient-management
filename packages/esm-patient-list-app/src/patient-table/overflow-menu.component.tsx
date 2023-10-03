import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { removePatientFromList } from '../api/api-remote';
import { ExtensionSlot, isDesktop, showToast, useLayoutType } from '@openmrs/esm-framework';
import { OverflowMenu, Layer, OverflowMenuItem, Modal } from '@carbon/react';
import overflowMenuStyles from './overflow-menu.scss';

interface OverflowMenuCellProps {
  cohortMembershipUuid: string;
  cohortName: string;
  mutatePatientListMembers: () => void;
}

const OverflowMenuComponent: React.FC<OverflowMenuCellProps> = ({
  cohortMembershipUuid,
  cohortName,
  mutatePatientListMembers,
}) => {
  const { t } = useTranslation();
  const layoutType = useLayoutType();
  const desktopLayout = isDesktop(layoutType);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const confirmRemovePatientFromList = useCallback(async () => {
    setIsDeleting(true);
    try {
      await removePatientFromList(cohortMembershipUuid);
      mutatePatientListMembers();
      showToast({
        title: t('removed', 'Removed'),
        description: `${t('successRemovePatientFromList', 'Successfully removed patient from list')}: ${cohortName}`,
      });
    } catch (error) {
      showToast({
        title: t('error', 'Error'),
        kind: 'error',
        description: `${t('errorRemovePatientFromList', 'Failed to remove patient from list')}: ${cohortName}`,
      });
    }

    setIsDeleting(false);
    setShowConfirmationModal(false);
  }, [cohortMembershipUuid, cohortName, mutatePatientListMembers, t]);

  return (
    <Layer className={overflowMenuStyles.layer}>
      <OverflowMenu
        data-floating-menu-container
        ariaLabel={`Remove patient from the ${cohortName} list`}
        size={desktopLayout ? 'sm' : 'lg'}
        flipped>
        <ExtensionSlot name="cohort-member-action-items" />
        <OverflowMenuItem
          size={desktopLayout ? 'sm' : 'lg'}
          className={overflowMenuStyles.menuItem}
          onClick={() => setShowConfirmationModal(true)}
          itemText={t('removePatient', 'Remove patient')}
          isDelete
        />
      </OverflowMenu>

      {showConfirmationModal && (
        <Modal
          open
          danger
          modalHeading={t('confirmRemovePatient', 'Are you sure you want to remove this patient from {cohortName}?', {
            cohortName: cohortName,
          })}
          modalLabel={t('removePatient', 'Remove patient')}
          primaryButtonText="Remove patient"
          secondaryButtonText="Cancel"
          onRequestClose={() => setShowConfirmationModal(false)}
          onRequestSubmit={confirmRemovePatientFromList}
          primaryButtonDisabled={isDeleting}
        />
      )}
    </Layer>
  );
};

export default OverflowMenuComponent;

import { SkeletonText, OverflowMenuItem } from '@carbon/react';
import { showModal, useVisit } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TransitionOverflowMenuItemProps {
  patientUuid: string;
}

const TransitionOverflowMenuItem: React.FC<TransitionOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { activeVisit, isLoading } = useVisit(patientUuid) || {};

  const handleLaunchModal = () => {
    const dispose = showModal('transition-patient-to-latest-queue-modal', {
      closeModal: () => dispose(),
      activeVisit,
    });
  };

  if (isLoading) {
    return <SkeletonText />;
  }

  if (!activeVisit) {
    return null;
  }

  return (
    <>
      <OverflowMenuItem itemText={t('transitionPatient', 'Transition patient')} onClick={handleLaunchModal} />
    </>
  );
};

export default TransitionOverflowMenuItem;

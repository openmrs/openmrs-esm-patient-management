import React from 'react';
import { OverflowMenuItem, SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showModal, useVisit } from '@openmrs/esm-framework';

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

  if (!activeVisit) {
    return null;
  }

  if (isLoading) {
    return <SkeletonText />;
  }

  return <OverflowMenuItem itemText={t('transitionPatient', 'Transition patient')} onClick={handleLaunchModal} />;
};

export default TransitionOverflowMenuItem;

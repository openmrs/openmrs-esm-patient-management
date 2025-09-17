import React from 'react';
import { type WardPatient } from '../../types';
import useWardLocation from '../../hooks/useWardLocation';
import { InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface IncorrectAdmissionWarningRowProps {
  wardPatient: WardPatient;
}

/**
 * This row appears in the patient card when the patient either has no active visit,
 * or has no inpatient admission, or their inpatient admission is not for the current ward.
 * This is unlikely an inconsistent data state, and this component shows a warning to indicate that.
 */
const IncorrectAdmissionWarningRow: React.FC<IncorrectAdmissionWarningRowProps> = ({ wardPatient }) => {
  const { location } = useWardLocation();
  const { t } = useTranslation();

  const { visit, inpatientAdmission } = wardPatient;

  if (!visit) {
    return (
      <InlineNotification hideCloseButton kind="warning" lowContrast title={t('noActiveVisit', 'No active visit')} />
    );
  }
  if (!inpatientAdmission) {
    return (
      <InlineNotification hideCloseButton kind="warning" lowContrast title={t('noAdmission', 'No admission found')} />
    );
  }

  if (inpatientAdmission.currentInpatientLocation.uuid !== location?.uuid) {
    return (
      <InlineNotification
        hideCloseButton
        kind="warning"
        lowContrast
        title={t('admittedTo', 'Admitted to {{locationName}}', {
          locationName: inpatientAdmission.currentInpatientLocation.display,
        })}
      />
    );
  }

  return null;
};

export default IncorrectAdmissionWarningRow;

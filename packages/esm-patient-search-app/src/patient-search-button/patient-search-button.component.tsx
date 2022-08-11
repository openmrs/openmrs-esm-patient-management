import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';

interface PatientSearchButtonProps {
  buttonText?: string;
  overlayHeader?: string;
  onPatientSelect?: (patientUuid: string) => {};
  buttonProps?: Object;
}

const PatientSearchButton: React.FC<PatientSearchButtonProps> = ({
  buttonText,
  overlayHeader,
  onPatientSelect,
  buttonProps,
}) => {
  const { t } = useTranslation();
  const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);

  return (
    <>
      {showSearchOverlay && (
        <PatientSearchOverlay
          onClose={() => setShowSearchOverlay(false)}
          header={overlayHeader}
          onPatientSelect={onPatientSelect}
        />
      )}

      <Button
        onClick={() => setShowSearchOverlay(true)}
        aria-label="Search Patient Button"
        aria-labelledby="Search Patient Button"
        renderIcon={(props) => <Search size={20} {...props} />}
        {...buttonProps}>
        {buttonText ? buttonText : t('searchPatient', 'Search Patient')}
      </Button>
    </>
  );
};

export default PatientSearchButton;

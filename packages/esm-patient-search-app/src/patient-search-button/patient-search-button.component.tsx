import React, { useState } from 'react';
import { Button } from 'carbon-components-react';
import Search20 from '@carbon/icons-react/es/search/20';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import Overlay from '../ui-components/overlay';
import { useTranslation } from 'react-i18next';
import CompactPatientSearchComponent from '../compact-patient-search/compact-patient-search.component';
import PatientSearchComponent from '../patient-search-page/patient-search-lg.component';

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
  const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);
  const { t } = useTranslation();

  return (
    <>
      {showSearchOverlay && (
        <Overlay
          close={() => setShowSearchOverlay(false)}
          header={overlayHeader ? overlayHeader : t('searchResults', 'Search Results')}>
          <PatientSearchComponent query={''} onPatientSelect={onPatientSelect} />
        </Overlay>
      )}

      <Button
        onClick={() => setShowSearchOverlay(true)}
        aria-label="Search Patient Button"
        aria-labelledby="Search Patient Button"
        renderIcon={Search20}
        {...buttonProps}>
        {buttonText ? buttonText : t('searchPatient', 'Search Patient')}
      </Button>
    </>
  );
};

export default PatientSearchButton;

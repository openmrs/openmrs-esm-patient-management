import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import PatientSearchOverlay from '../patient-search-overlay/patient-search-overlay.component';
import { PatientSearchContext } from '../patient-search-context';

interface PatientSearchButtonProps {
  buttonText?: string;
  overlayHeader?: string;
  selectPatientAction?: (patientUuid: string) => {};
  buttonProps?: Object;
}

const PatientSearchButton: React.FC<PatientSearchButtonProps> = ({
  buttonText,
  overlayHeader,
  selectPatientAction,
  buttonProps,
}) => {
  const { t } = useTranslation();
  const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);

  const hidePanel = useCallback(() => {
    setShowSearchOverlay(false);
  }, [setShowSearchOverlay]);

  return (
    <>
      {showSearchOverlay && (
        <PatientSearchContext.Provider
          value={{
            nonNavigationSelectPatientAction: selectPatientAction,
            patientClickSideEffect: hidePanel,
          }}>
          <PatientSearchOverlay onClose={hidePanel} header={overlayHeader} />
        </PatientSearchContext.Provider>
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

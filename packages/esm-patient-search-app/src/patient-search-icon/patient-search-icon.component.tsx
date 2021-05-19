import React, { useCallback, useEffect, useState } from 'react';
import Search20 from '@carbon/icons-react/es/search/20';
import { HeaderGlobalAction } from 'carbon-components-react/es/components/UIShell';
import styles from './patient-search-icon.component.scss';
import PatientSearch from '../patient-search/patient-search.component';

interface PatientSearchLaunchProps {}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = () => {
  const [open, setOpen] = useState<boolean>(false);

  const togglePatientSearch = useCallback(() => {
    setOpen((prevState) => !prevState);
  }, []);

  const patientSearchRef = React.useRef(null);
  const current = patientSearchRef?.current;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (current && !current.contains(event.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [current]);

  return (
    <div ref={patientSearchRef}>
      <HeaderGlobalAction
        onClick={togglePatientSearch}
        aria-label="Search Patient"
        aria-labelledby="Searcch Patient"
        name="SearchPatientIcon"
        className={styles.headerGlobalAction}>
        <Search20 />
      </HeaderGlobalAction>
      {open && (
        <div className={styles.patientLaunchContainer}>
          <PatientSearch hidePanel={togglePatientSearch} />
        </div>
      )}
    </div>
  );
};

export default PatientSearchLaunch;

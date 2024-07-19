import React, { useEffect } from 'react';
import styles from './o2-clinicial-dashboard.scss';

interface O2ClinicalDashboardProps {
  patientUuid: string;
}

const O2ClinicialDashboard: React.FC<O2ClinicalDashboardProps> = ({ patientUuid }) => {
  useEffect(() => {
    const cssLink = document.createElement('link');
    cssLink.href = '/openmrs/ms/uiframework/resource/coreapps/styles/noheader.css';
    cssLink.rel = 'stylesheet';
    cssLink.type = 'text/css';
    frames['clinicial-dashboard'].document.head.appendChild(cssLink);
  }, []);

  return (
    <div>
      <iframe
        name="clinicial-dashboard"
        src={`/openmrs/coreapps/clinicianfacing/patient.page?patientId=${patientUuid}`}
        className={styles.dashboard}></iframe>
    </div>
  );
};

export default O2ClinicialDashboard;

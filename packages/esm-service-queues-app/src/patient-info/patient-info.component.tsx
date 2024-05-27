import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ClickableTile } from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import {
  age,
  displayName,
  formatDate,
  parseDate,
  ConfigurableLink,
  PatientPhoto,
  PatientBannerToggleContactDetailsButton,
  PatientBannerContactDetails,
} from '@openmrs/esm-framework';
import AppointmentDetails from './appointment-details.component';
import styles from './patient-info.scss';

interface PatientInfoProps {
  patient: fhir.Patient;
  handlePatientInfoClick: () => void;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient, handlePatientInfoClick }) => {
  const { t } = useTranslation();
  const [showContactDetails, setShowContactDetails] = useState<boolean>(false);
  const patientName = displayName(patient);

  const toggleShowMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContactDetails((prevState) => !prevState);
  };

  return (
    <ClickableTile className={styles.container} onClick={handlePatientInfoClick}>
      <div
        className={classNames({
          [styles.activePatientInfoContainer]: showContactDetails,
          [styles.patientInfoContainer]: !showContactDetails,
        })}>
        <PatientPhoto patientUuid={patient.id} patientName={patientName} size="small" />
        <div className={styles.patientInfoContent}>
          <div className={styles.patientInfoRow}>
            <span className={styles.patientName}>{patientName}</span>
            <ConfigurableLink
              className={styles.patientEditBtn}
              to={`\${openmrsSpaBase}/patient/${patient.id}/edit`}
              title={t('editPatientDetails', 'Edit patient details')}>
              <Edit size={16} />
            </ConfigurableLink>
          </div>
          <div className={styles.patientInfoRow}>
            <div className={styles.demographics}>
              <span>
                {(patient.gender ?? t('unknown', 'Unknown')).replace(/^\w/, (c) => c.toUpperCase())} &middot;{' '}
              </span>
              <span>{age(patient.birthDate)} &middot; </span>
              <span>{formatDate(parseDate(patient.birthDate), { mode: 'wide', time: false })}</span>
            </div>
          </div>
          <div className={styles.patientInfoRow}>
            <span className={styles.identifier}>
              {patient.identifier.length ? patient.identifier.map((identifier) => identifier.value).join(', ') : '--'}
            </span>
            <PatientBannerToggleContactDetailsButton
              showContactDetails={showContactDetails}
              toggleContactDetails={toggleShowMore}
            />
          </div>
        </div>
      </div>
      {showContactDetails && (
        <>
          <PatientBannerContactDetails patientId={patient.id} deceased={patient.deceasedBoolean} />
          <AppointmentDetails patientUuid={patient.id} />
        </>
      )}
    </ClickableTile>
  );
};

export default PatientInfo;

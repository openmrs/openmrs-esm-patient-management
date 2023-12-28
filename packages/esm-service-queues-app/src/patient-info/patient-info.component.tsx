import React, { useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ClickableTile } from '@carbon/react';
import { ChevronDown, ChevronUp, Edit } from '@carbon/react/icons';
import { age, ExtensionSlot, formatDate, parseDate, ConfigurableLink } from '@openmrs/esm-framework';
import AppointmentDetails from './appointment-details.component';
import ContactDetails from './contact-details.component';
import styles from './patient-info.scss';

interface PatientInfoProps {
  patient: fhir.Patient;
  handlePatientInfoClick: () => void;
}

const PatientInfo: React.FC<PatientInfoProps> = ({ patient, handlePatientInfoClick }) => {
  const { t } = useTranslation();
  const [showContactDetails, setShowContactDetails] = useState<boolean>(false);
  const patientName = `${patient.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const patientPhotoSlotState = React.useMemo(
    () => ({ patientUuid: patient.id, patientName }),
    [patient.id, patientName],
  );

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
        <ExtensionSlot name="patient-photo-slot" state={patientPhotoSlotState} />
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
            <Button
              kind="ghost"
              renderIcon={(props) =>
                showContactDetails ? <ChevronUp size={16} {...props} /> : <ChevronDown size={16} {...props} />
              }
              iconDescription="Toggle contact details"
              onClick={(e) => toggleShowMore(e)}>
              {showContactDetails ? t('showLess', 'Show less') : t('showAllDetails', 'Show all details')}
            </Button>
          </div>
        </div>
      </div>
      {showContactDetails && (
        <>
          <ContactDetails patientId={patient.id} address={patient.address ?? []} contact={patient.contact} />
          <AppointmentDetails patientUuid={patient.id} />
        </>
      )}
    </ClickableTile>
  );
};

export default PatientInfo;

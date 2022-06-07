import { age, ExtensionSlot, formatDate, parseDate, ConfigurableLink } from '@openmrs/esm-framework';
import { Button, ClickableTile } from 'carbon-components-react';
import React, { useState } from 'react';
import styles from './patient-info.scss';
import ChevronDown16 from '@carbon/icons-react/es/chevron--down/16';
import ChevronUp16 from '@carbon/icons-react/es/chevron--up/16';
import { useTranslation } from 'react-i18next';
import ContactDetails from './contact-details.component';
import Edit16 from '@carbon/icons-react/es/edit/16';
import AppointmentDetails from './appointment-details.component';
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

  const patientGender = () => {
    if (patient.gender === 'M') {
      return t('male', 'Male');
    }
    if (patient.gender === 'F') {
      return t('female', 'Female');
    }
    return t('unknown', 'Unknown');
  };

  const toggleShowMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowContactDetails((prevState) => !prevState);
  };

  return (
    <ClickableTile className={styles.container} onClick={handlePatientInfoClick}>
      <div className={`${showContactDetails ? styles.activePatientInfoContainer : styles.patientInfoContainer}`}>
        <ExtensionSlot extensionSlotName="patient-photo-slot" state={patientPhotoSlotState} />
        <div className={styles.patientInfoContent}>
          <div className={styles.patientInfoRow}>
            <span className={styles.patientName}>{patientName}</span>
            <ConfigurableLink
              to={`\${openmrsSpaBase}/patient/${patient.id}/edit`}
              className={styles.patientEditBtn}
              title={t('editPatientDetails', 'Edit Patient Details')}>
              <Edit16 />
            </ConfigurableLink>
          </div>
          <div className={styles.patientInfoRow}>
            <div className={styles.demographics}>
              <span>{patientGender()} &middot; </span>
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
              renderIcon={showContactDetails ? ChevronUp16 : ChevronDown16}
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

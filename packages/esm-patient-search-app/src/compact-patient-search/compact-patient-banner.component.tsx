import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonIcon, SkeletonText } from '@carbon/react';
import { ExtensionSlot, useConfig, interpolateString, navigate, ConfigurableLink, age } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types/index';
import styles from './compact-patient-banner.scss';

interface CompactPatientBannerProps {
  patient: SearchedPatient;
  selectPatientAction?: (evt, patient: SearchedPatient) => void;
}

const CompactPatientBanner: React.FC<CompactPatientBannerProps> = ({ patient, selectPatientAction }) => {
  const config = useConfig();
  const { t } = useTranslation();

  const getGender = (gender) => {
    switch (gender) {
      case 'M':
        return t('male', 'Male');
      case 'F':
        return t('female', 'Female');
      case 'O':
        return t('other', 'Other');
      case 'U':
        return t('unknown', 'Unknown');
      default:
        return gender;
    }
  };

  return (
    <ConfigurableLink
      onClick={(evt) => selectPatientAction(evt, patient)}
      to={`${interpolateString(config.search.patientResultUrl, {
        patientUuid: patient.uuid,
      })}/${encodeURIComponent(config.search.redirectToPatientDashboard)}`}
      key={patient.uuid}
      className={styles.patientSearchResult}>
      <div className={styles.patientAvatar} role="img">
        <ExtensionSlot
          extensionSlotName="patient-photo-slot"
          state={{
            patientUuid: patient.uuid,
            patientName: patient.person.personName.display,
            size: 'small',
          }}
        />
      </div>
      <div>
        <h2 className={styles.patientName}>{patient.person.personName.display}</h2>
        <p className={styles.demographics}>
          {getGender(patient.person.gender)} <span className={styles.middot}>&middot;</span>{' '}
          {age(patient.person.birthdate)} <span className={styles.middot}>&middot;</span>{' '}
          {patient.identifiers?.[0]?.identifier}
        </p>
      </div>
    </ConfigurableLink>
  );
};

export const SearchResultSkeleton = () => {
  return (
    <div className={styles.patientSearchResult}>
      <div className={styles.patientAvatar} role="img">
        <SkeletonIcon
          style={{
            height: '3rem',
            width: '3rem',
          }}
        />
      </div>
      <div>
        <h2 className={styles.patientName}>
          <SkeletonText />
        </h2>
        <span className={styles.demographics}>
          <SkeletonIcon /> <span className={styles.middot}>&middot;</span> <SkeletonIcon />{' '}
          <span className={styles.middot}>&middot;</span> <SkeletonIcon />
        </span>
      </div>
    </div>
  );
};

export default CompactPatientBanner;

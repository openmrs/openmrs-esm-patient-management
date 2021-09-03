import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import styles from './patient-search-result.scss';
import { interpolateString, ExtensionSlot, useConfig, navigate, attach, detach } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types/index';
import CustomOverflowMenuComponent from '../ui-components/overflow-menu.component';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import { useTranslation } from 'react-i18next';

const PatientSearchResults: React.FC<PatientSearchResultsProps> = ({ patients, hidePanel }) => {
  const config = useConfig();
  const { t } = useTranslation();

  useEffect(() => {
    attach('patient-search-actions-slot', 'add-patient-to-patient-list-button');
    return () => detach('patient-search-actions-slot', 'add-patient-to-patient-list-button');
  }, []);

  function renderPatient(patient: SearchedPatient) {
    const preferredIdentifier = patient.identifiers.find((i) => i.preferred) || patient.identifiers[0];

    return (
      <div key={patient.display} className={styles.patientChart}>
        <div className={styles.container}>
          <div className={styles.patientBanner}>
            <div className={styles.patientAvatar}>
              <ExtensionSlot extensionSlotName="patient-photo-slot" state={{ patientUuid: patient.uuid }} />
            </div>
            <div
              role="button"
              className={styles.patientInfo}
              tabIndex={0}
              onClick={() => {
                navigate({
                  to: interpolateString(config.search.patientResultUrl, {
                    patientUuid: patient.uuid,
                  }),
                });
                hidePanel();
              }}>
              <div>
                <span className={styles.patientName}>{patient.person.display}</span>
              </div>
              <div className={styles.demographics}>
                <span>{patient.person.gender === 'M' ? 'Male' : 'Female'}</span> &middot;{' '}
                <span>
                  {patient.person.age} {patient.person.age === 1 ? 'year' : 'years'}
                </span>{' '}
                &middot; <span>{dayjs(patient.person.birthdate).format('DD - MMM - YYYY')}</span>
              </div>
              <div>
                <span className={styles.identifiers}>{preferredIdentifier.identifier}</span>
              </div>
            </div>
            <div className={styles.actionsContainer}>
              <CustomOverflowMenuComponent
                menuTitle={
                  <>
                    <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                    <OverflowMenuVertical16 style={{ marginLeft: '0.5rem' }} />
                  </>
                }>
                <ExtensionSlot
                  extensionSlotName="patient-search-actions-slot"
                  key="patient-search-actions-slot"
                  state={{ patientUuid: patient.uuid }}
                />
              </CustomOverflowMenuComponent>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{patients.map((patient) => renderPatient(patient))}</>;
};

interface PatientSearchResultsProps {
  patients: Array<SearchedPatient>;
  hidePanel?: any;
}

export default PatientSearchResults;

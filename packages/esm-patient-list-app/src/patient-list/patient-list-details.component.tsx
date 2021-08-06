import React, { useMemo, useState, useEffect } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import CustomOverflowMenu from '../ui-components/overflow-menu.component';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import PatientListDataTable from '../patient-table/patient-table.component';
import styles from './patient-list-detail.scss';
import { fetchPatientListDetails, OpenmrsCohort, fetchPatientListMembers, OpenmrsCohortMember } from '../api';

const PatientListDetails: React.FC<RouteComponentProps<{ patientListUuid: string }>> = ({ match }) => {
  const { t } = useTranslation();
  const { patientListUuid } = match?.params;
  const [patientListDetails, setPatientListDetails] = useState<OpenmrsCohort>(null);
  const [patientListMembers, setPatientListMembers] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchPatientListDetails(patientListUuid, abortController).then(({ data }) => setPatientListDetails(data));
    const custom = 'cohort,head,role,startDate,attributes,description,endDate,name,patient:(uuid,display),uuid,voided';
    fetchPatientListMembers(patientListUuid, abortController).then((results) => setPatientListMembers(results));

    return () => abortController.abort();
  }, []);

  return (
    <div className="omrs-main-content">
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      <div className={styles.patientListBanner}>
        <div className={styles.leftBannerSection}>
          <h5 className={styles.bodyShort02}>
            {t(
              'aListOfPatientsThatHaventBeenSeenFor30DaysSinceTheirMissedAppointment',
              "A list of patients that haven't been seen for 30 days, since their missed appointment",
            )}
          </h5>
          <div className={`${styles.secondaryText} ${styles.bodyShort01}`} style={{ marginTop: '0.5rem' }}>
            <span>
              {patientListMembers?.length} {t('patients', 'patients')}
            </span>{' '}
            · <span className={styles.label01}>Last Updated:</span> 12 / Oct / 2020
          </div>
        </div>
        <div className={styles.rightBannerSection}>
          <CustomOverflowMenu
            menuTitle={
              <>
                <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                <OverflowMenuVertical16 style={{ marginLeft: '0.5rem' }} />
              </>
            }>
            <ExtensionSlot extensionSlotName="patient-list-actions-slot" />
          </CustomOverflowMenu>
        </div>
      </div>
    </div>
  );
};

export default PatientListDetails;

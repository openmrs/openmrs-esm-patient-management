import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, usePagination } from '@openmrs/esm-framework';
import CustomOverflowMenu from '../ui-components/overflow-menu.component';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import PatientListDataTable from '../patient-table/patient-table.component';
import styles from './patient-list-detail.scss';
import { fetchPatientListDetails, OpenmrsCohort, fetchPatientListMembers, OpenmrsCohortMember } from '../api';

interface PatientListDetailProps {
  patientListUuid: string;
}

const PatientListDetails: React.FC<RouteComponentProps<PatientListDetailProps>> = ({ match }) => {
  const { t } = useTranslation();
  const { patientListUuid } = match?.params;
  const [patientListDetails, setPatientListDetails] = useState<OpenmrsCohort>(null);
  const [patientListMembers, setPatientListMembers] = useState<{ name: string }[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [searchString, setSearchString] = useState('');
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const abortController = new AbortController();
    fetchPatientListDetails(patientListUuid, abortController).then(({ data }) => setPatientListDetails(data));
    fetchPatientListMembers(patientListUuid, abortController).then((results) => {
      setPatientListMembers(
        results.map((cohortMember: OpenmrsCohortMember) => ({
          name: cohortMember?.patient?.display,
          startDate: cohortMember?.startDate,
        })),
      );
      setLoading(false);
    });

    return () => abortController.abort();
  }, []);

  const headers = useMemo(
    () => [
      {
        id: '1',
        key: 'name',
        header: 'Name',
      },
      {
        id: '2',
        key: 'startDate',
        header: 'Start Date',
      },
    ],
    [],
  );

  const { results, paginated, currentPage, goTo } = usePagination(patientListMembers, pageSize);

  const handlePageChange = useCallback(({ page, newPageSize }) => {
    if (currentPage != page) {
      goTo(page);
    }
    if (pageSize != newPageSize) {
      setPageSize(newPageSize);
    }
  }, []);

  useEffect(() => {
    if (currentPage != 1) {
      goTo(1);
    }
  }, [searchString]);

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
      <PatientListDataTable
        columns={headers}
        patients={results}
        isLoading={isLoading}
        pagination={{
          usePagination: paginated,
          currentPage,
          pageSize: 10,
          totalItems: patientListMembers.length,
          onChange: handlePageChange,
        }}
        search={{
          onSearch: setSearchString,
          placeHolder: 'Search',
          currentSearchTerm: searchString,
        }}
      />
    </div>
  );
};

export default PatientListDetails;

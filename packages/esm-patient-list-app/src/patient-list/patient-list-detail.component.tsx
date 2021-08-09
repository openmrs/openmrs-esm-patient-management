import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, usePagination } from '@openmrs/esm-framework';
import CustomOverflowMenu from '../ui-components/overflow-menu.component';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import PatientListDataTable from '../patient-table/patient-table.component';
import styles from './patient-list-detail.scss';
import { fetchPatientListDetails, OpenmrsCohort, fetchPatientListMembers, OpenmrsCohortMember } from '../api';
import dayjs from 'dayjs';
import EditPatientListDetailsButton from '../patient-list-actions/edit-patient-list.component';
import DuplicatePatientListButton from '../patient-list-actions/duplicate-patient-list.component';
import DeletePatientListButton from '../patient-list-actions/delete-patient-list.component';

function formatDateTime(datetime: string): string {
  return dayjs(datetime).format('DD-MMM-YYYY');
}

interface PatientListDetailProps {
  patientListUuid: string;
}

const PatientListDetails: React.FC<RouteComponentProps<PatientListDetailProps>> = ({ match }) => {
  const { t } = useTranslation();
  const { patientListUuid } = match?.params;
  const [patientListDetails, setPatientListDetails] = useState<OpenmrsCohort>(null);
  const [patientListMembers, setPatientListMembers] = useState<{ name: string; startDate: string }[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [searchString, setSearchString] = useState('');
  const [currentPageSize, setCurrentPageSize] = useState(10);

  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() != '') {
      const search = searchString.toLowerCase();
      return patientListMembers.filter((patient) =>
        Object.values(patient).some((value) => value.toLowerCase().includes(search)),
      );
    } else {
      return patientListMembers;
    }
  }, [searchString, patientListMembers]);

  const { results, paginated, currentPage, goTo } = usePagination(searchResults, currentPageSize);

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

  useEffect(() => {
    const abortController = new AbortController();
    fetchPatientListDetails(patientListUuid, abortController).then(({ data }) => setPatientListDetails(data));
    fetchPatientListMembers(patientListUuid, abortController).then((results) => {
      setPatientListMembers(
        results.map((cohortMember: OpenmrsCohortMember) => ({
          name: cohortMember?.patient?.display,
          startDate: formatDateTime(cohortMember?.startDate),
        })),
      );
      setLoading(false);
    });

    return () => abortController.abort();
  }, []);

  const handlePageChange = useCallback(
    ({ page, pageSize }) => {
      if (currentPage != page) {
        goTo(page);
      }
      if (currentPageSize != pageSize) {
        setCurrentPageSize(pageSize);
      }
    },
    [currentPage, currentPageSize],
  );

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
          <h4 className={styles.expressiveHeading03}>{patientListDetails?.name}</h4>
          <h5 className={styles.bodyShort02}>{patientListDetails?.description}</h5>
          <div className={`${styles.secondaryText} ${styles.bodyShort01}`} style={{ marginTop: '0.5rem' }}>
            <span>
              {patientListMembers?.length} {t('patients', 'patients')}
            </span>{' '}
            · <span className={styles.label01}>Last Updated:</span>
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
            <EditPatientListDetailsButton />
            <DuplicatePatientListButton />
            <DeletePatientListButton />
            <ExtensionSlot extensionSlotName="patient-list-actions-slot" />
          </CustomOverflowMenu>
        </div>
      </div>
      <PatientListDataTable
        columns={headers}
        patients={results}
        isLoading={isLoading}
        pagination={{
          usePagination: true,
          currentPage,
          pageSize: currentPageSize,
          totalItems: searchResults.length,
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

import React, { useState, useCallback, useMemo } from 'react';
import { ExtensionSlot, formatDate, parseDate } from '@openmrs/esm-framework';
import { RouteComponentProps } from 'react-router-dom';
import styles from './appointment-detail.scss';
import { useTranslation } from 'react-i18next';
import PatientListTable from '../patient-table/patient-table.component';
import { usePatientListDetails, usePatientListMembers } from '../api/hooks';

function getPatientListUuidFromUrl(): string {
  const match = /\/patient-list\/([a-zA-Z0-9\-]+)\/?/.exec(location.pathname);
  return match && match[1];
}
interface PatientListMemberRow {
  name: string;
  identifier: string;
  sex: string;
  startDate: string;
  uuid: string;
}

interface PatientListDetailProps {
  patientListUuid: string;
}

const PatientListDetailComponent: React.FC<RouteComponentProps<PatientListDetailProps>> = () => {
  const patientListUuid = getPatientListUuidFromUrl();
  const { t } = useTranslation();
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchString, setSearchString] = useState('');
  const { data: patientListDetails, mutate: mutatePatientListDetails } = usePatientListDetails(patientListUuid);
  const { data: patientListMembers } = usePatientListMembers(
    patientListUuid,
    searchString,
    (currentPage - 1) * currentPageSize,
    currentPageSize,
  );

  const patients: PatientListMemberRow[] = useMemo(
    () =>
      patientListMembers
        ? patientListMembers?.length
          ? patientListMembers?.map((member) => ({
              name: member?.patient?.person?.display,
              identifier: member?.patient?.identifiers[0]?.identifier ?? null,
              sex: member?.patient?.person?.gender,
              startDate: formatDate(parseDate(member?.startDate)),
              uuid: `${member?.patient?.uuid}`,
            }))
          : []
        : [],
    [patientListMembers],
  );

  const headers = useMemo(
    () => [
      {
        key: 'name',
        header: t('name', 'Name'),
        link: {
          getUrl: (patient) =>
            patient?.uuid ? `${window.spaBase}/patient/${patient?.uuid}/chart/` : window?.location?.href,
        },
      },
      {
        key: 'dateTime',
        header: t('dateTime', 'Date & Time'),
      },
      {
        key: 'serviceType',
        header: t('serviceType', 'Service Type'),
      },
      {
        key: 'provider',
        header: t('provider', 'Provider'),
      },
      {
        key: 'location',
        header: t('location', 'Location'),
      },
    ],
    [t],
  );

  const handleSearch = useCallback((str) => {
    setPageCount(1);
    setSearchString(str);
  }, []);

  return (
    <main className={`omrs-main-content ${styles.patientListDetailsPage}`}>
      <section>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
        <div className={styles.cohortHeader}>
          <div>
            {patientListDetails && (
              <>
                <h1 className={styles.productiveHeading03}>{patientListDetails?.name}</h1>
                <h4 className={`${styles.bodyShort02} ${styles.marginTop}`}>{patientListDetails?.description}</h4>
                <div className={` ${styles.text02} ${styles.bodyShort01} ${styles.marginTop}`}>
                  {patientListDetails?.size} {t('patients', 'patients')} &middot;{' '}
                  <span className={styles.label01}>{t('createdOn', 'Created on')}:</span>{' '}
                  {patientListDetails?.startDate ? formatDate(parseDate(patientListDetails.startDate)) : null}
                </div>
              </>
            )}
          </div>
        </div>
        <div className={styles.tableContainer}>
          <PatientListTable
            patients={patients}
            columns={headers}
            isLoading={!patientListMembers && !patients}
            isFetching={!patientListMembers}
            search={{
              onSearch: handleSearch,
              placeHolder: 'Search',
            }}
            pagination={{
              usePagination: patientListDetails?.size > currentPageSize,
              currentPage,
              onChange: ({ page, pageSize }) => {
                setPageCount(page);
                setCurrentPageSize(pageSize);
              },
              pageSize: 10,
              totalItems: patientListDetails?.size,
              pagesUnknown: true,
              lastPage:
                patients?.length < currentPageSize || currentPage * currentPageSize === patientListDetails?.size,
            }}
          />
        </div>
      </section>
    </main>
  );
};

export default PatientListDetailComponent;

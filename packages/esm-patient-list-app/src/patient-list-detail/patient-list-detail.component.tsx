import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { RouteComponentProps } from 'react-router-dom';
import styles from './patient-list-detail.scss';
import { usePatientListDetails, usePatientListMembers } from '../api';
import CustomOverflowMenuComponent from '../ui-components/overflow-menu.component';
import { OverflowMenuVertical16 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem, SkeletonText } from 'carbon-components-react';
import PatientListTable from '../patient-table/patient-table.component';
import dayjs from 'dayjs';

interface PatientRow {
  name: string;
  identifier: string;
  sex: string;
  startDate: string;
}

function formatDate(date: string): string {
  return dayjs(date).format('DD / MMM / YYYY');
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

const PatientListDetailComponent: React.FC<RouteComponentProps<PatientListDetailProps>> = ({ match }) => {
  const { patientListUuid } = match.params;
  const [patientListDetails] = usePatientListDetails(patientListUuid);
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const patientListMembers = usePatientListMembers(
    patientListUuid,
    (currentPage - 1) * currentPageSize,
    currentPageSize,
  );
  const { t } = useTranslation();
  const [searchString, setSearchString] = useState('');

  const patients: PatientListMemberRow[] = useMemo(
    () =>
      patientListMembers
        ? patientListMembers?.map((member) => ({
            name: member?.patient?.person?.display,
            identifier: member?.patient?.identifiers[0].identifier ?? null,
            sex: member?.patient?.person?.gender,
            startDate: formatDate(member?.patient?.startDate),
            uuid: member?.patient?.uuid,
          }))
        : [],
    [patientListMembers],
  );

  const headers = useMemo(
    () => [
      {
        key: 'name',
        header: t('name', 'Name'),
        link: {
          getUrl: (patient) => `${window.spaBase}/patient/${patient?.uuid}`,
        },
      },
      {
        key: 'identifier',
        header: t('identifier', 'Identifier'),
      },
      {
        key: 'sex',
        header: t('sex', 'Sex'),
      },
      {
        key: 'startDate',
        header: t('startDate', 'Start Date'),
      },
    ],
    [t],
  );

  const searchResults = useMemo(
    () =>
      patients.filter((patient) =>
        Object.values(patient).some((value) => value?.toLowerCase().includes(searchString?.toLowerCase())),
      ),
    [patients, searchString],
  );

  const handleSearch = useCallback((str) => {
    setPageCount(1);
    setSearchString(str);
  }, []);

  return (
    <main className="omrs-main-content">
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      <div className={styles.cohortHeader}>
        {patientListDetails ? (
          <div>
            <h1 className={styles.productiveHeading03}>{patientListDetails?.name}</h1>
            <h4 className={`${styles.bodyShort02} ${styles.marginTop}`}>{patientListDetails?.description}</h4>
            <div className={` ${styles.text02} ${styles.bodyShort01} ${styles.marginTop}`}>
              {patientListDetails?.size} {t('patients', 'patients')} &middot;{' '}
              <span className={styles.label01}>{t('createdOn', 'Created on')}:</span>{' '}
              {formatDate(patientListDetails?.startDate ?? '')}
            </div>
          </div>
        ) : (
          <SkeletonText heading />
        )}
        <CustomOverflowMenuComponent
          menuTitle={
            <>
              <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
              <OverflowMenuVertical16 style={{ marginLeft: '0.5rem' }} />
            </>
          }>
          <OverflowMenuItem itemText={t('editNameDescription', 'Edit Name/ Description')} />
        </CustomOverflowMenuComponent>
      </div>
      <div className={styles.tableContainer}>
        <PatientListTable
          patients={searchResults}
          columns={headers}
          isLoading={!patientListMembers && !patients}
          search={{
            onSearch: handleSearch,
            placeHolder: 'Search',
          }}
          pagination={{
            usePagination: true,
            currentPage,
            onChange: ({ page, pageSize }) => {
              if (currentPage !== page) {
                setPageCount(page);
              }
              if (currentPageSize !== pageSize) {
                setCurrentPageSize(pageSize);
              }
            },
            pageSize: 10,
            totalItems: patientListDetails?.size,
            pagesUnknown: true,
            lastPage: searchResults?.length < currentPageSize,
          }}
        />
      </div>
    </main>
  );
};

export default PatientListDetailComponent;

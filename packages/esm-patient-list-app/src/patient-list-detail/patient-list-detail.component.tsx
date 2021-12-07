import React, { useState, useCallback, useMemo } from 'react';
import { ExtensionSlot, showToast, navigate } from '@openmrs/esm-framework';
import { RouteComponentProps } from 'react-router-dom';
import styles from './patient-list-detail.scss';
import { usePatientListDetails, usePatientListMembers, deletePatientList } from '../api';
import CustomOverflowMenuComponent from '../ui-components/overflow-menu/overflow-menu.component';
import { OverflowMenuVertical16 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from 'carbon-components-react';
import PatientListTable from '../patient-table/patient-table.component';
import dayjs from 'dayjs';
import EditPatientListDetailsOverlay from '../ui-components/create-edit-patient-list/create-edit-list.component';

interface PatientRow {
  name: string;
  identifier: string;
  sex: string;
  startDate: string;
}

function formatDate(date: string): string {
  return dayjs(date).format('DD / MMM / YYYY');
}

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
  const [showEditPatientListDetailOverlay, setEditPatientListDetailOverlay] = useState(false);

  const patients: PatientListMemberRow[] = useMemo(
    () =>
      patientListMembers
        ? patientListMembers?.length
          ? patientListMembers?.map((member) => ({
              name: member?.patient?.person?.display,
              identifier: member?.patient?.identifiers[0]?.identifier ?? null,
              sex: member?.patient?.person?.gender,
              startDate: formatDate(member?.startDate),
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

  const handleSearch = useCallback((str) => {
    setPageCount(1);
    setSearchString(str);
  }, []);

  const handleDelete = useCallback(() => {
    deletePatientList(patientListUuid)
      .then(() =>
        showToast({
          title: t('deleted', 'Deleted'),
          description: `${t('deletedPatientList', 'Deleted patient list')}: ${patientListDetails?.name}`,
          kind: 'success',
        }),
      )
      .then(() => navigate({ to: `${window.spaBase}/patient-list/` }))
      .catch(() =>
        showToast({
          title: t('error', 'Error'),
          description: t('errorDeleteList', "Couldn't delete patient list"),
          kind: 'error',
        }),
      );
  }, [patientListUuid, patientListDetails, t]);

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
                  {formatDate(patientListDetails?.startDate ?? '')}
                </div>
              </>
            )}
          </div>
          <CustomOverflowMenuComponent
            menuTitle={
              <>
                <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                <OverflowMenuVertical16 style={{ marginLeft: '0.5rem' }} />
              </>
            }>
            <OverflowMenuItem
              itemText={t('editNameDescription', 'Edit Name/ Description')}
              onClick={() => setEditPatientListDetailOverlay(true)}
            />
            <OverflowMenuItem itemText={t('delete', 'Delete')} onClick={handleDelete} isDelete />
          </CustomOverflowMenuComponent>
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
      <section>
        {showEditPatientListDetailOverlay && (
          <EditPatientListDetailsOverlay
            close={() => setEditPatientListDetailOverlay(false)}
            edit
            patientListDetails={patientListDetails}
            onSuccess={mutatePatientListDetails}
          />
        )}
      </section>
    </main>
  );
};

export default PatientListDetailComponent;

import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OverflowMenuVertical } from '@carbon/react/icons';
import {
  navigate,
  formatDate,
  parseDate,
  showSnackbar,
  CustomOverflowMenu,
  CustomOverflowMenuItem,
  launchWorkspace2,
  showModal,
} from '@openmrs/esm-framework';
import { deletePatientList } from '../api/patient-list.resource';
import { usePatientListDetails, usePatientListMembers } from '../api/hooks';
import ListDetailsTable from '../list-details-table/list-details-table.component';
import styles from './list-details.scss';

interface ListDetails {
  name: string;
  identifier: string;
  sex: string;
  startDate: string;
  uuid: string;
  membershipUuid?: string;
  mobile?: string | null;
}

const ListDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const patientListUuid = params.patientListUuid;
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchString] = useState('');

  const { listDetails, mutateListDetails } = usePatientListDetails(patientListUuid);
  const { listMembers, isLoadingListMembers, mutateListMembers } = usePatientListMembers(
    patientListUuid,
    searchString,
    (currentPage - 1) * currentPageSize,
    currentPageSize,
  );

  const patients: Array<ListDetails> = useMemo(
    () =>
      listMembers
        ? listMembers?.length
          ? listMembers?.map((member) => ({
              name: member?.patient?.person?.display,
              identifier: member?.patient?.identifiers[0]?.identifier ?? null,
              sex: member?.patient?.person?.gender,
              startDate: member?.startDate ? formatDate(parseDate(member.startDate)) : null,
              uuid: `${member?.patient?.uuid}`,
              membershipUuid: member?.uuid,
              mobile:
                member?.patient?.person?.attributes?.find((attr) => attr?.attributeType?.display === 'Telephone Number')
                  ?.value ?? null,
            }))
          : []
        : [],
    [listMembers],
  );

  const headers = useMemo(
    () => [
      {
        key: 'name',
        header: t('name', 'Name'),
        link: {
          getUrl: (patient) =>
            patient?.uuid ? `${window.getOpenmrsSpaBase()}patient/${patient?.uuid}/chart/` : window?.location?.href,
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
      {
        key: 'mobile',
        header: t('mobile', 'Mobile'),
      },
    ],
    [t],
  );

  const handleEditPatientList = useCallback(() => {
    launchWorkspace2('patient-list-form-workspace', {
      patientListDetails: listDetails,
      onSuccess: mutateListDetails,
    });
  }, [listDetails, mutateListDetails]);

  const handleDeletePatientList = useCallback(() => {
    const dispose = showModal('delete-patient-list-modal', {
      listName: listDetails?.name,
      listSize: listDetails?.size,
      onConfirm: async () => {
        await deletePatientList(patientListUuid)
          .then(() => {
            showSnackbar({
              title: t('deleted', 'Deleted'),
              subtitle: `${t('deletedPatientList', 'Deleted patient list')}: ${listDetails?.name}`,
              kind: 'success',
              isLowContrast: true,
            });
            navigate({ to: window.getOpenmrsSpaBase() + 'home/patient-lists' });
          })
          .catch((e) =>
            showSnackbar({
              title: t('errorDeletingList', 'Error deleting patient list'),
              subtitle: e?.message,
              kind: 'error',
            }),
          );
      },
      close: () => dispose(),
    });
  }, [listDetails?.name, listDetails?.size, patientListUuid, t]);

  return (
    <main className={styles.container}>
      <section className={styles.cohortHeader}>
        <div data-testid="patientListHeader">
          <h1 className={styles.productiveHeading03}>{listDetails?.name ?? '--'}</h1>
          <h4 className={classNames(styles.bodyShort02, styles.marginTop)}>{listDetails?.description ?? '--'}</h4>
          <div className={classNames(styles.text02, styles.bodyShort01, styles.marginTop)}>
            {listDetails?.size} {t('patients', 'patients')} &middot;{' '}
            <span className={styles.label01}>{t('createdOn', 'Created on')}:</span>{' '}
            {listDetails?.startDate ? formatDate(parseDate(listDetails.startDate)) : null}
          </div>
        </div>
        <div className={styles.overflowMenu}>
          <CustomOverflowMenu
            menuTitle={
              <>
                <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                <OverflowMenuVertical size={16} style={{ marginLeft: '0.5rem' }} />
              </>
            }>
            <CustomOverflowMenuItem
              className={styles.menuItem}
              itemText={t('editNameDescription', 'Edit name or description')}
              onClick={handleEditPatientList}
            />
            <CustomOverflowMenuItem
              className={styles.menuItem}
              isDelete
              itemText={t('deletePatientList', 'Delete patient list')}
              onClick={handleDeletePatientList}
            />
          </CustomOverflowMenu>
        </div>
      </section>
      <section>
        <div className={styles.tableContainer}>
          <ListDetailsTable
            cohortUuid={patientListUuid}
            columns={headers}
            isFetching={!listMembers}
            isLoading={isLoadingListMembers}
            mutateListDetails={mutateListDetails}
            mutateListMembers={mutateListMembers}
            patients={patients}
            pagination={{
              usePagination: listDetails?.size > currentPageSize,
              currentPage,
              onChange: ({ page, pageSize }) => {
                setPageCount(page);
                setCurrentPageSize(pageSize);
              },
              pageSize: 10,
              totalItems: listDetails?.size,
              pagesUnknown: true,
              lastPage: patients?.length < currentPageSize || currentPage * currentPageSize === listDetails?.size,
            }}
          />
        </div>
      </section>
    </main>
  );
};

export default ListDetails;

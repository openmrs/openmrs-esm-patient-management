import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem, Modal } from '@carbon/react';
import { OverflowMenuVertical } from '@carbon/react/icons';
import { navigate, formatDate, parseDate,  showSnackbar } from '@openmrs/esm-framework';
import { deletePatientList } from '../api/api-remote';
import { usePatientListDetails, usePatientListMembers } from '../api/hooks';
import CreateEditPatientList from '../create-edit-patient-list/create-edit-list.component';
import CustomOverflowMenuComponent from '../overflow-menu/overflow-menu.component';
import ListDetailsTable from '../list-details-table/list-details-table.component';
import styles from './list-details.scss';

interface ListDetails {
  name: string;
  identifier: string;
  sex: string;
  startDate: string;
  uuid: string;
}

const ListDetails = () => {
  const { t } = useTranslation();
  const params = useParams();
  const patientListUuid = params.patientListUuid;
  const [currentPage, setPageCount] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchString, setSearchString] = useState('');
  const { listDetails, mutateListDetails } = usePatientListDetails(patientListUuid);
  const { listMembers, isLoadingListMembers, mutateListMembers } = usePatientListMembers(
    patientListUuid,
    searchString,
    (currentPage - 1) * currentPageSize,
    currentPageSize,
  );

  const [showEditPatientListDetailOverlay, setEditPatientListDetailOverlay] = useState(false);
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

  const patients: Array<ListDetails> = useMemo(
    () =>
      listMembers
        ? listMembers?.length
          ? listMembers?.map((member) => ({
              name: member?.patient?.person?.display,
              identifier: member?.patient?.identifiers[0]?.identifier ?? null,
              sex: member?.patient?.person?.gender,
              startDate: formatDate(parseDate(member?.startDate)),
              uuid: `${member?.patient?.uuid}`,
              membershipUuid: member?.uuid,
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

  const handleDelete = useCallback(() => {
    setShowDeleteConfirmationModal(true);
  }, []);

  const confirmDeletePatientList = useCallback(() => {
    deletePatientList(patientListUuid)
      .then(() => {
        showSnackbar({
          title: t('deleted', 'Deleted'),
          subtitle: `${t('deletedPatientList', 'Deleted patient list')}: ${listDetails?.name}`,
          kind: 'success',
        });

        navigate({ to: window.getOpenmrsSpaBase() + 'home/patient-lists' });
      })
      .catch((e) =>
        showSnackbar({
          title: t('errorDeletingList', 'Error deleting patient list'),
          subtitle: e?.message,
          kind: 'error',
        }),
      )
      .finally(() => setShowDeleteConfirmationModal(false));
  }, [patientListUuid, listDetails, t]);

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
          <CustomOverflowMenuComponent
            menuTitle={
              <>
                <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                <OverflowMenuVertical size={16} style={{ marginLeft: '0.5rem' }} />
              </>
            }>
            <OverflowMenuItem
              className={styles.menuItem}
              itemText={t('editNameDescription', 'Edit name or description')}
              onClick={() => setEditPatientListDetailOverlay(true)}
            />
            <OverflowMenuItem
              className={styles.menuItem}
              itemText={t('deletePatientList', 'Delete patient list')}
              onClick={handleDelete}
              isDelete
            />
          </CustomOverflowMenuComponent>
        </div>
      </section>
      <section>
        <div className={styles.tableContainer}>
          <ListDetailsTable
            patients={patients}
            columns={headers}
            isLoading={isLoadingListMembers}
            isFetching={!listMembers}
            mutateListMembers={mutateListMembers}
            mutateListDetails={mutateListDetails}
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
        {showEditPatientListDetailOverlay && (
          <CreateEditPatientList
            close={() => setEditPatientListDetailOverlay(false)}
            isEditing
            patientListDetails={listDetails}
            onSuccess={mutateListDetails}
          />
        )}
        {showDeleteConfirmationModal && (
          <Modal
            open
            danger
            modalHeading={t('confirmDeletePatientList', 'Are you sure you want to delete this patient list?')}
            primaryButtonText="Delete"
            secondaryButtonText="Cancel"
            onRequestClose={() => setShowDeleteConfirmationModal(false)}
            onRequestSubmit={confirmDeletePatientList}
            primaryButtonDisabled={false}>
            {listDetails?.size > 0 ? (
              <p>
                {t('patientListMemberCount', 'This list has {{count}} patients', {
                  count: listDetails.size,
                })}
                .
              </p>
            ) : (
              <p>{t('emptyList', 'This list has no patients')}</p>
            )}
          </Modal>
        )}
      </section>
    </main>
  );
};

export default ListDetails;

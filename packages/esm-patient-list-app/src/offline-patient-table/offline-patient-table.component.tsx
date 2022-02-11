import React from 'react';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Search,
  SearchSkeleton,
  SkeletonText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  FilterRowsData,
  TableSelectAll,
  TableSelectRow,
} from 'carbon-components-react';
import {
  useStore,
  getOfflinePatientDataStore,
  useSessionUser,
  age,
  useLayoutType,
  syncOfflinePatientData,
  showModal,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import capitalize from 'lodash-es/capitalize';
import LastUpdatedTableCell from './last-updated-table-cell.component';
import styles from './offline-patient-table.scss';
import PatientNameTableCell from './patient-name-table-cell.component';
import Renew32 from '@carbon/icons-react/es/renew/32';
import { removePatientFromLocalPatientList, offlinePatientListId } from '../api/api-local';
import { useGetAllPatientsFromOfflineListQuery } from '../api/queries';

export interface OfflinePatientTableProps {
  isInteractive: boolean;
  showHeader: boolean;
}

const OfflinePatientTable: React.FC<OfflinePatientTableProps> = ({ isInteractive, showHeader }) => {
  const { t } = useTranslation();
  const store = useStore(getOfflinePatientDataStore());
  const userId = useSessionUser()?.user.uuid;
  const layout = useLayoutType();
  const { isValidating, data: patients, mutate } = useGetAllPatientsFromOfflineListQuery(userId);
  const toolbarItemSize = layout === 'desktop' ? 'sm' : undefined;

  const headers = [
    {
      key: 'name',
      header: t('offlinePatientsTableHeaderName', 'Name'),
    },
    {
      key: 'lastUpdated',
      header: t('offlinePatientsTableHeaderLastUpdated', 'Last updated'),
    },
    {
      key: 'gender',
      header: t('offlinePatientsTableHeaderGender', 'Gender'),
    },
    {
      key: 'age',
      header: t('offlinePatientsTableHeaderAge', 'Age'),
    },
  ];

  const rows =
    patients?.map((patient) => {
      const syncState = store.offlinePatientDataSyncState?.[patient.id];

      return {
        id: patient.id,
        name: patient,
        lastUpdated: syncState,
        gender: capitalize(patient.gender),
        age: patient.birthDate ? age(patient.birthDate) : '',
      };
    }) ?? [];

  const handleUpdateSelectedPatientsClick = async (selectedRows: Array<{ id: string }>) => {
    const patientUuids = selectedRows.map((row) => row.id);
    return await syncOfflinePatientDataOfAllGivenPatients(patientUuids);
  };

  const handleRemovePatientsFromOfflineListClick = async (selectedRows: Array<{ id: string }>) => {
    const closeModal = showModal('offline-tools-confirmation-modal', {
      title: t('offlinePatientsTableDeleteConfirmationModalTitle', 'Remove offline patients'),
      children: t(
        'offlinePatientsTableDeleteConfirmationModalContent',
        'Are you sure that you want to remove all selected patients from the offline list? The charts will no longer be available in offline mode.',
      ),
      confirmText: t('offlinePatientsTableDeleteConfirmationModalConfirm', 'Remove patients'),
      cancelText: t('offlinePatientsTableDeleteConfirmationModalCancel', 'Cancel'),
      closeModal: () => closeModal(),
      onConfirm: async () => {
        const patientUuids = selectedRows.map((row) => row.id);
        for (const patientUuid of patientUuids) {
          await removePatientFromLocalPatientList(userId, offlinePatientListId, patientUuid);
        }

        mutate();
      },
    });
  };

  if (isValidating) {
    return <TableSkeleton showHeader={showHeader} />;
  }

  return (
    <>
      <DataTable rows={rows} headers={headers} filterRows={filterTableRows}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getTableContainerProps,
          getSelectionProps,
          onInputChange,
          selectedRows,
        }) => (
          <TableContainer className={styles.tableContainer} {...getTableContainerProps()}>
            <div className={styles.tableHeaderContainer}>
              {showHeader && (
                <h4 className={styles.tableHeader}>{t('offlinePatientsTableTitle', 'Offline patients')}</h4>
              )}
              {selectedRows.length === 0 && (
                <Search
                  className={styles.tableSearch}
                  labelText={t('offlinePatientsTableSearchLabel', 'Search this list')}
                  placeholder={t('offlinePatientsTableSearchPlaceholder', 'Search this list')}
                  size={toolbarItemSize}
                  onChange={onInputChange}
                  light
                />
              )}
              {selectedRows.length > 0 && (
                <>
                  <Button
                    className={styles.tableSecondaryAction}
                    kind="ghost"
                    size={toolbarItemSize}
                    renderIcon={Renew32}
                    onClick={() => handleUpdateSelectedPatientsClick(selectedRows)}>
                    {selectedRows.length === 1
                      ? t('offlinePatientsTableUpdatePatient', 'Update patient')
                      : t('offlinePatientsTableUpdatePatients', 'Update patients')}
                  </Button>
                  <Button
                    className={styles.tablePrimaryAction}
                    kind="danger"
                    size={toolbarItemSize}
                    onClick={() => handleRemovePatientsFromOfflineListClick(selectedRows)}>
                    {t('offlinePatientsTableRemoveFromOfflineList', 'Remove from list')}
                  </Button>
                </>
              )}
            </div>
            <Table {...getTableProps()} isSortable useZebraStyles>
              <TableHead>
                <TableRow>
                  {isInteractive && <TableSelectAll {...getSelectionProps()} />}
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })} isSortable>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {isInteractive && <TableSelectRow {...getSelectionProps({ row })} />}
                    {row.cells.map((cell) => {
                      switch (cell.info.header) {
                        case 'name':
                          return <PatientNameTableCell key={cell.id} patient={cell.value} />;
                        case 'lastUpdated':
                          return <LastUpdatedTableCell key={cell.id} syncState={cell.value} patientUuid={row.id} />;
                        default:
                          return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      }
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </>
  );
};

const TableSkeleton: React.FC<{ showHeader: boolean }> = ({ showHeader }) => {
  return (
    <TableContainer className={styles.tableContainer}>
      <div className={styles.tableHeaderContainer}>
        {showHeader && <SkeletonText heading width="20%" className={styles.tableHeader} />}
        <SearchSkeleton className={styles.tableSearch} />
      </div>
      <DataTableSkeleton showToolbar={false} showHeader={false} />
    </TableContainer>
  );
};

function filterTableRows({
  rowIds,
  headers,
  cellsById,
  inputValue,
  // @ts-ignore `getCellId` is not in the types, but present in Carbon.
  getCellId,
}: FilterRowsData) {
  // Adapted from https://github.com/carbon-design-system/carbon-components-react/blob/c3bf0123a2a98ca84acfc7e86e69840eaf57a89e/src/components/DataTable/tools/filter.js#L23
  // Notable change: Instead of using the cell's value as a literal string, this JSON.stringify's the
  // cell value first. This means that filtering even works with complex JS objects.
  // This may have to be refined eventually, but for the moment it gives good results with minimal effort.
  return rowIds.filter((rowId) =>
    headers.some(({ key }) => {
      const cellId = getCellId(rowId, key);
      return JSON.stringify(cellsById[cellId].value).toLowerCase().includes(inputValue.toLowerCase());
    }),
  );
}

function syncOfflinePatientDataOfAllGivenPatients(patientUuids: Array<string>) {
  return Promise.all(patientUuids.map((patientUuid) => syncOfflinePatientData(patientUuid)));
}

export default OfflinePatientTable;

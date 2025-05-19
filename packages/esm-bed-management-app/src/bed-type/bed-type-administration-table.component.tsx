import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  IconButton,
  InlineLoading,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { ErrorState, isDesktop as desktopLayout, showModal, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import CardHeader from '../card-header/card-header.component';
import Header from '../header/header.component';
import { deleteBedType, useBedTypes } from '../summary/summary.resource';
import type { BedTypeData } from '../types';
import styles from '../bed-administration/bed-administration-table.scss';

const BedTypeAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('bedTypes', 'Bed types');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);
  const { bedTypes, errorLoadingBedTypes, isLoadingBedTypes, isValidatingBedTypes, mutateBedTypes } = useBedTypes();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const openNewBedTypeModal = () => {
    const dispose = showModal('new-bed-type-modal', {
      closeModal: () => dispose(),
      mutate: mutateBedTypes,
    });
  };

  const openEditBedTypeModal = useCallback(
    (editData: BedTypeData) => {
      const dispose = showModal('edit-bed-type-modal', {
        closeModal: () => dispose(),
        mutate: mutateBedTypes,
        editData,
      });
    },
    [mutateBedTypes],
  );

  const handleDeleteBedType = useCallback(
    (bedTypeId: string, reason: string, bedTypeData: BedTypeData, closeModal: () => void) => {
      deleteBedType({ bedTypeId, reason })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedTypeDeleted', 'Bed type deleted'),
            subtitle: t('bedTypeDeletedSuccessfully', "The bed type '{{bedTypeName}}' has been succesfully deleted", {
              bedTypeName: bedTypeData.name,
            }),
          });
          mutateBedTypes();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorDeletingBedType', 'Error deleting bed type'),
            subtitle: error?.message,
          });
        })
        .finally(closeModal);
    },
    [t, mutateBedTypes],
  );

  const openDeleteBedTypeModal = useCallback(
    (bedTypeData: BedTypeData) => {
      const dispose = showModal('delete-bed-type-modal', {
        bedTypeData: bedTypeData,
        handleDeleteBedType: handleDeleteBedType,
        closeModal: () => dispose(),
      });
    },
    [handleDeleteBedType],
  );

  const tableHeaders = [
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('displayName', 'Display name'),
      key: 'displayName',
    },
    {
      header: t('description', 'Description'),
      key: 'description',
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const tableRows = useMemo(
    () =>
      bedTypes?.map((entry) => ({
        id: entry.uuid,
        name: entry?.name,
        displayName: entry?.displayName,
        description: entry?.description,
        actions: (
          <>
            <IconButton
              align="top-start"
              enterDelayMs={300}
              kind="ghost"
              label={t('editBedType', 'Edit bed type')}
              onClick={(e) => {
                e.preventDefault();
                openEditBedTypeModal(entry);
              }}
              size={responsiveSize}>
              <Edit />
            </IconButton>
            <IconButton
              align="top-start"
              enterDelayMs={300}
              kind="ghost"
              label={t('deleteBedType', 'Delete bed type')}
              onClick={(e) => {
                e.preventDefault();
                openDeleteBedTypeModal(entry);
              }}
              size={responsiveSize}>
              <TrashCan />
            </IconButton>
          </>
        ),
      })),
    [openEditBedTypeModal, openDeleteBedTypeModal, responsiveSize, bedTypes, t],
  );

  if (isLoadingBedTypes) {
    return (
      <>
        <Header title={t('bedTypes', 'Bed types')} />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (errorLoadingBedTypes) {
    return (
      <>
        <Header title={t('bedTypes', 'Bed types')} />
        <div className={styles.widgetCard}>
          <ErrorState error={errorLoadingBedTypes} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('bedTypes', 'Bed types')} />
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidatingBedTypes ? <InlineLoading /> : null}</span>
          </span>
          {bedTypes?.length ? (
            <Button kind="ghost" renderIcon={(props) => <Add size={16} {...props} />} onClick={openNewBedTypeModal}>
              {t('addBedType', 'Add bed type')}
            </Button>
          ) : null}
        </CardHeader>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key}>{header.header?.content ?? header.header}</TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noDataToDisplay', 'No data to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                    <p className={styles.separator}>{t('or', 'or')}</p>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={(props) => <Add size={16} {...props} />}
                      onClick={openNewBedTypeModal}>
                      {t('addBedType', 'Add bed type')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={bedTypes.length}
                onChange={({ page, pageSize }) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                }}
              />
            </TableContainer>
          )}
        </DataTable>
      </div>
    </>
  );
};
export default BedTypeAdministrationTable;

import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
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
import type { BedTagData } from '../types';
import { deleteBedTag, useBedTags } from '../summary/summary.resource';
import CardHeader from '../card-header/card-header.component';
import Header from '../header/header.component';
import styles from '../bed-administration/bed-administration-table.scss';

const BedTagAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('bedTags', 'Bed tags');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);
  const { bedTags, errorLoadingBedTags, isLoadingBedTags, isValidatingBedTags, mutateBedTags } = useBedTags();

  const [isBedDataLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const launchNewBedTagModal = () => {
    const dispose = showModal('new-bed-tag-modal', {
      closeModal: () => dispose(),
      mutate: mutateBedTags,
    });
  };

  const launchEditBedTagModal = useCallback(
    (editData: BedTagData) => {
      const dispose = showModal('edit-bed-tag-modal', {
        closeModal: () => dispose(),
        mutate: mutateBedTags,
        editData: editData,
      });
    },
    [mutateBedTags],
  );

  const handleDeleteBedTag = useCallback(
    (bedTagId: string, reason: string, bedTagData: BedTagData, closeModal: () => void) => {
      deleteBedTag({ bedTagId, reason })
        .then(() => {
          showSnackbar({
            kind: 'success',
            title: t('bedTagDeleted', 'Bed tag deleted'),
            subtitle: t('bedTagDeletedSuccessfully', "The bed tag '{{bedTagName}}' has been succesfully deleted", {
              bedTagName: bedTagData.name,
            }),
          });
          mutateBedTags();
        })
        .catch((error) => {
          showSnackbar({
            kind: 'error',
            title: t('errorDeletingBedTag', 'Error deleting bed tag'),
            subtitle: error?.message,
          });
        })
        .finally(closeModal);
    },
    [t, mutateBedTags],
  );

  const launchDeleteBedTagModal = useCallback(
    (bedTagData: BedTagData) => {
      const dispose = showModal('delete-bed-tag-modal', {
        bedTagData: bedTagData,
        handleDeleteBedTag: handleDeleteBedTag,
        closeModal: () => dispose(),
      });
    },
    [handleDeleteBedTag],
  );

  const tableHeaders = [
    {
      header: t('ids', 'ID'),
      key: 'id',
    },
    {
      header: t('name', 'Name'),
      key: 'name',
    },
    {
      header: t('actions', 'Actions'),
      key: 'actions',
    },
  ];

  const tableRows = useMemo(() => {
    return bedTags?.map((entry) => ({
      id: entry.id,
      name: entry?.name,
      actions: (
        <>
          <Button
            enterDelayMs={300}
            renderIcon={Edit}
            onClick={() => launchEditBedTagModal(entry)}
            kind={'ghost'}
            iconDescription={t('editBedTag', 'Edit Bed Tag')}
            hasIconOnly
            size={responsiveSize}
            tooltipAlignment="start"
          />
          <Button
            enterDelayMs={300}
            renderIcon={TrashCan}
            onClick={() => launchDeleteBedTagModal(entry)}
            kind={'ghost'}
            iconDescription={t('deleteBedTag', 'Delete Bed Tag')}
            hasIconOnly
            size={responsiveSize}
            tooltipAlignment="start"
          />
        </>
      ),
    }));
  }, [bedTags, t, responsiveSize, launchEditBedTagModal, launchDeleteBedTagModal]);

  if (isBedDataLoading || isLoadingBedTags) {
    return (
      <>
        <Header title={t('bedTags', 'Bed tags')} />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (errorLoadingBedTags) {
    return (
      <>
        <Header title={t('bedTags', 'Bed tags')} />
        <div className={styles.widgetCard}>
          <ErrorState error={errorLoadingBedTags} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('bedTags', 'Bed tags')} />

      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidatingBedTags ? <InlineLoading /> : null}</span>
          </span>
          {bedTags?.length ? (
            <Button kind="ghost" renderIcon={(props) => <Add size={16} {...props} />} onClick={launchNewBedTagModal}>
              {t('addBedTag', 'Add bed tag')}
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
                      <TableHeader>{header.header?.content ?? header.header}</TableHeader>
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
                      <p className={styles.content}>{t('No data', 'No data to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                    <p className={styles.separator}>{t('or', 'or')}</p>
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={(props) => <Add size={16} {...props} />}
                      onClick={launchNewBedTagModal}>
                      {t('addBedTag', 'Add bed tag')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={bedTags.length}
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
export default BedTagAdministrationTable;

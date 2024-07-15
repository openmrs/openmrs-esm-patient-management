import React, { useMemo, useState } from 'react';
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
import { Add, Edit } from '@carbon/react/icons';
import { ErrorState, isDesktop as desktopLayout, useLayoutType } from '@openmrs/esm-framework';
import type { BedTagData } from '../types';
import { useBedTag } from '../summary/summary.resource';
import Header from '../header/header.component';
import styles from '../bed-administration/bed-administration-table.scss';
import { CardHeader } from '../card-header/card-header.component';
import BedTagForm from './new-tag-form.component';
import EditBedTagForm from './edit-tag-form.component';

const BedTagAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('bedTag', 'Bed Tag');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);
  const [isBedDataLoading] = useState(false);
  const [showBedTagsModal, setAddBedTagsModal] = useState(false);
  const [showEditBedModal, setShowEditBedModal] = useState(false);
  const [editData, setEditData] = useState<BedTagData>();
  const [currentPage, setCurrentPage] = useState(1);
  const { bedTypeData, isError, loading, validate, mutate } = useBedTag();
  const [pageSize, setPageSize] = useState(10);

  const tableHeaders = [
    {
      header: t('ids', 'Id'),
      key: 'ids',
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
    return bedTypeData?.map((entry) => ({
      id: entry.uuid,
      ids: entry.id,
      name: entry?.name,
      actions: (
        <>
          <Button
            enterDelayMs={300}
            renderIcon={Edit}
            onClick={(e) => {
              e.preventDefault();
              setEditData(entry);
              setShowEditBedModal(true);
              setAddBedTagsModal(false);
            }}
            kind={'ghost'}
            iconDescription={t('editBedTag', 'Edit Bed Tag')}
            hasIconOnly
            size={responsiveSize}
            tooltipAlignment="start"
          />
        </>
      ),
    }));
  }, [responsiveSize, bedTypeData, t]);

  if (isBedDataLoading || loading) {
    return (
      <>
        <Header route="Bed Tag" />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header route="Bed Tag" />
        <div className={styles.widgetCard}>
          <ErrorState error={isError} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header route="Bed Tag" />

      <div className={styles.widgetCard}>
        {showBedTagsModal ? (
          <BedTagForm onModalChange={setAddBedTagsModal} showModal={showBedTagsModal} mutate={mutate} />
        ) : null}
        {showEditBedModal ? (
          <EditBedTagForm
            onModalChange={setShowEditBedModal}
            showModal={showEditBedModal}
            editData={editData}
            mutate={mutate}
          />
        ) : null}
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{validate ? <InlineLoading /> : null}</span>
          </span>
          {bedTypeData?.length ? (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => setAddBedTagsModal(true)}>
              {t('addBedTag', 'Add Bed Tag')}
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
                      onClick={() => setAddBedTagsModal(true)}>
                      {t('bedTag', 'Add Bed Tag')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={bedTypeData.length}
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

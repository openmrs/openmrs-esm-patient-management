import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  InlineLoading,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
  Tile,
} from '@carbon/react';
import { Add, Edit } from '@carbon/react/icons';
import {
  ErrorState,
  isDesktop as desktopLayout,
  launchWorkspace2,
  useLayoutType,
  usePagination,
} from '@openmrs/esm-framework';
import { type Bed, type BedFormWorkspaceConfig, type WorkspaceMode } from '../types';
import { useBedsGroupedByLocation } from '../summary/summary.resource';
import CardHeader from '../card-header/card-header.component';
import Header from '../header/header.component';
import styles from './bed-administration-table.scss';

const BedAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('bedAllocation', 'Bed allocation');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);

  const {
    bedsGroupedByLocation,
    isLoadingBedsGroupedByLocation,
    isValidatingBedsGroupedByLocation,
    mutateBedsGroupedByLocation,
    errorFetchingBedsGroupedByLocation,
  } = useBedsGroupedByLocation();
  const [filterOption, setFilterOption] = useState('ALL');

  function CustomTag({ condition }: { condition: boolean }) {
    const { t } = useTranslation();

    if (condition) {
      return (
        <Tag type="green" size="md">
          {t('yes', 'Yes')}
        </Tag>
      );
    }

    return (
      <Tag type="red" size="md">
        {t('no', 'No')}
      </Tag>
    );
  }

  const handleLaunchBedWorkspace = useCallback(
    (mode: WorkspaceMode, bed?: Bed) => {
      const config: BedFormWorkspaceConfig = {
        mutateBeds: mutateBedsGroupedByLocation,
      };

      if (mode === 'edit' && bed) {
        config.bed = bed;
      }

      launchWorkspace2('bed-form-workspace', config);
    },
    [mutateBedsGroupedByLocation],
  );

  const handleBedStatusChange = ({ selectedItem }: { selectedItem: string }) =>
    setFilterOption(selectedItem.trim().toUpperCase());

  const filteredData = useMemo(() => {
    const flattenedData = Array.isArray(bedsGroupedByLocation) ? bedsGroupedByLocation.flat() : [];
    return filterOption === 'ALL' ? flattenedData : flattenedData.filter((bed) => bed.status === filterOption);
  }, [bedsGroupedByLocation, filterOption]);

  const [pageSize, setPageSize] = useState(10);
  const { results: paginatedData, currentPage, goTo } = usePagination(filteredData, pageSize);

  const tableHeaders = [
    {
      key: 'bedNumber',
      header: t('bedId', 'Bed ID'),
    },
    {
      key: 'location',
      header: t('location', 'Location'),
    },
    {
      key: 'occupancyStatus',
      header: t('occupancyStatus', 'Occupancy status'),
    },
    {
      key: 'allocationStatus',
      header: t('allocationStatus', 'Allocated'),
    },
    {
      key: 'actions',
      header: t('actions', 'Actions'),
    },
  ];

  const tableRows = useMemo(() => {
    return paginatedData.flat().map((bed) => ({
      id: bed.uuid,
      bedNumber: bed.bedNumber,
      location: bed.location.display,
      occupancyStatus: <CustomTag condition={bed?.status === 'OCCUPIED'} />,
      allocationStatus: <CustomTag condition={Boolean(bed.location?.uuid)} />,
      actions: (
        <Button
          renderIcon={Edit}
          onClick={() => handleLaunchBedWorkspace('edit', bed)}
          kind={'ghost'}
          iconDescription={t('editBed', 'Edit bed')}
          hasIconOnly
          size={responsiveSize}
          tooltipPosition="right"
        />
      ),
    }));
  }, [handleLaunchBedWorkspace, responsiveSize, paginatedData, t]);

  if (isLoadingBedsGroupedByLocation && !bedsGroupedByLocation.length) {
    return (
      <>
        <Header title={t('bedAllocation', 'Bed allocation')} />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (errorFetchingBedsGroupedByLocation) {
    return (
      <>
        <Header title={t('bedAllocation', 'Bed allocation')} />
        <div className={styles.widgetCard}>
          <ErrorState error={errorFetchingBedsGroupedByLocation} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={t('bedAllocation', 'Bed allocation')} />
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidatingBedsGroupedByLocation ? <InlineLoading /> : null}</span>
          </span>
          <div className={styles.headerActions}>
            <div className={styles.filterContainer}>
              <Dropdown
                autoAlign
                id="occupancyStatus"
                initialSelectedItem={'All'}
                items={['All', 'Available', 'Occupied']}
                label=""
                onChange={handleBedStatusChange}
                titleText={t('filterByOccupancyStatus', 'Filter by occupancy status') + ':'}
                type="inline"
              />
            </div>
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => handleLaunchBedWorkspace('add')}>
              {t('addBed', 'Add bed')}
            </Button>
          </div>
        </CardHeader>
        <DataTable rows={tableRows} headers={tableHeaders} isSortable size={isTablet ? 'lg' : 'sm'} useZebraStyles>
          {({ rows, headers, getTableProps }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader key={header.key}>
                        {typeof header.header === 'object' && header.header !== null && 'content' in header.header
                          ? (header.header.content as React.ReactNode)
                          : (header.header as React.ReactNode)}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {typeof cell.value === 'object' && cell.value !== null && 'content' in cell.value
                            ? (cell.value.content as React.ReactNode)
                            : (cell.value as React.ReactNode)}
                        </TableCell>
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
                      onClick={() => handleLaunchBedWorkspace('add')}>
                      {t('addBed', 'Add bed')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <div className={styles.paginationContainer}>
                <Pagination
                  backwardText="Previous page"
                  forwardText="Next page"
                  page={currentPage}
                  pageNumberText="Page Number"
                  pageSize={pageSize}
                  pageSizes={[10, 20, 30, 40, 50]}
                  totalItems={filteredData.length}
                  onChange={({ pageSize: newPageSize, page }) => {
                    if (newPageSize !== pageSize) {
                      setPageSize(newPageSize);
                      goTo(1);
                    }
                    if (page !== currentPage) {
                      goTo(page);
                    }
                  }}
                />
              </div>
            </TableContainer>
          )}
        </DataTable>
      </div>
    </>
  );
};

export default BedAdministrationTable;

import React, { useEffect, useMemo, useState } from 'react';
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
import { isDesktop as desktopLayout, useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import type { InitialData, Location } from '../types';
import { findBedByLocation, useWards } from '../summary/summary.resource';
import EditBedForm from './edit-bed-form.component';
import Header from '../header/header.component';
import NewBedForm from './new-bed-form.component';
import styles from './bed-administration-table.scss';

const BedAdministrationTable: React.FC = () => {
  const { t } = useTranslation();
  const headerTitle = t('wardAllocation', 'Ward Allocation');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const responsiveSize = isTablet ? 'lg' : 'sm';
  const isDesktop = desktopLayout(layout);
  const { admissionLocationTagUuid } = useConfig();

  const [wardsGroupedByLocations, setWardsGroupedByLocation] = useState<Array<Location>>([]);
  const [isBedDataLoading, setIsBedDataLoading] = useState(false);
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [showEditBedModal, setShowEditBedModal] = useState(false);
  const [editData, setEditData] = useState<InitialData>();
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

  const handleBedStatusChange = ({ selectedItem }: { selectedItem: string }) =>
    setFilterOption(selectedItem.trim().toUpperCase());

  const bedsMappedToLocation = wardsGroupedByLocations?.length ? [].concat(...wardsGroupedByLocations) : [];

  const { data, isLoading, error, isValidating, mutate } = useWards(admissionLocationTagUuid);

  const [currentPageSize, setPageSize] = useState(10);
  const pageSizes = [10, 20, 30, 40, 50];
  const { results, currentPage, totalPages, goTo } = usePagination(
    filterOption === 'ALL'
      ? bedsMappedToLocation
      : bedsMappedToLocation.filter((bed) => bed.status === filterOption) ?? [],
    currentPageSize,
  );

  useEffect(() => {
    if (!isLoading && data) {
      setIsBedDataLoading(true);
      const fetchData = async () => {
        const promises = data.data.results.map(async (ward) => {
          const bedLocations = await findBedByLocation(ward.uuid);
          if (bedLocations.data.results.length) {
            return bedLocations.data.results.map((bed) => ({
              ...bed,
              location: ward,
            }));
          }
          return null;
        });

        const updatedWards = (await Promise.all(promises)).filter(Boolean);
        setWardsGroupedByLocation(updatedWards);
        setIsBedDataLoading(false);
      };
      fetchData().finally(() => setIsBedDataLoading(false));
    }
  }, [data, isLoading, wardsGroupedByLocations.length]);

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
      header: t('occupancyStatus', 'Occupied'),
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
    return results.map((ward) => ({
      id: ward.uuid,
      bedNumber: ward.bedNumber,
      location: ward.location.display,
      occupancyStatus: <CustomTag condition={ward?.status === 'OCCUPIED'} />,
      allocationStatus: <CustomTag condition={ward.location?.uuid} />,
      actions: (
        <>
          <Button
            enterDelayMs={300}
            renderIcon={Edit}
            onClick={(e) => {
              e.preventDefault();
              setEditData(ward);
              setShowEditBedModal(true);
              setShowAddBedModal(false);
            }}
            kind={'ghost'}
            iconDescription={t('editBed', 'Edit Bed')}
            hasIconOnly
            size={responsiveSize}
            tooltipAlignment="start"
          />
        </>
      ),
    }));
  }, [responsiveSize, results, t]);

  if ((isBedDataLoading || isLoading) && !wardsGroupedByLocations.length) {
    return (
      <>
        <Header route="Ward Allocation" />
        <div className={styles.widgetCard}>
          <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header route="Ward Allocation" />
        <div className={styles.widgetCard}>
          <ErrorState error={error} headerTitle={headerTitle} />
        </div>
      </>
    );
  }

  return (
    <>
      <Header route="Ward Allocation" />
      <div className={styles.flexContainer}>
        {results?.length ? (
          <div className={styles.filterContainer}>
            <Dropdown
              id="occupancyStatus"
              initialSelectedItem={'All'}
              label=""
              titleText={t('filterByOccupancyStatus', 'Filter by occupancy status') + ':'}
              type="inline"
              items={['All', 'Available', 'Occupied']}
              onChange={handleBedStatusChange}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.widgetCard}>
        {showAddBedModal ? (
          <NewBedForm onModalChange={setShowAddBedModal} showModal={showAddBedModal} mutate={mutate} />
        ) : null}
        {showEditBedModal ? (
          <EditBedForm
            onModalChange={setShowEditBedModal}
            showModal={showEditBedModal}
            editData={editData}
            mutate={mutate}
          />
        ) : null}
        <CardHeader title={headerTitle}>
          <span className={styles.backgroundDataFetchingIndicator}>
            <span>{isValidating ? <InlineLoading /> : null}</span>
          </span>
          {results?.length ? (
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              onClick={() => setShowAddBedModal(true)}>
              {t('addBed', 'Add bed')}
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
                      onClick={() => setShowAddBedModal(true)}>
                      {t('addBed', 'Add bed')}
                    </Button>
                  </Tile>
                </div>
              ) : null}
              <Pagination
                backwardText="Previous page"
                forwardText="Next page"
                page={currentPage}
                pageNumberText="Page Number"
                pageSize={totalPages}
                pageSizes={pageSizes?.length > 0 ? pageSizes : [10]}
                totalItems={bedsMappedToLocation.length ?? 0}
                onChange={({ pageSize, page }) => {
                  if (pageSize !== currentPageSize) {
                    setPageSize(pageSize);
                  }
                  if (page !== currentPage) {
                    goTo(page);
                  }
                }}
              />
            </TableContainer>
          )}
        </DataTable>
      </div>
    </>
  );
};

export default BedAdministrationTable;

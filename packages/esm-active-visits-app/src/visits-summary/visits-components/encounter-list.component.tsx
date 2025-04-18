import {
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import { isDesktop, type Obs, useLayoutType } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../visit-detail-overview.scss';
import EncounterObservations from './encounter-observations.component';

interface EncounterListProps {
  encounters: Array<{
    id: any;
    time: any;
    encounterType: string;
    provider: string;
    obs: Array<Obs>;
  }>;
  visitUuid: string;
}

const EncounterListDataTable: React.FC<EncounterListProps> = ({ encounters, visitUuid }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [headerWidth, setHeaderWidth] = useState(0);
  const headerRef = useRef(null);

  const headerData = useMemo(
    () => [
      {
        id: 1,
        header: t('time', 'Time'),
        key: 'time',
      },
      {
        id: 2,
        header: t('encounterType', 'Encounter Type'),
        key: 'encounterType',
      },
      {
        id: 3,
        header: t('provider', 'Provider'),
        key: 'provider',
      },
    ],
    [t],
  );

  useEffect(() => {
    setHeaderWidth(headerRef?.current?.clientWidth);
    const handler = () => setHeaderWidth(headerRef?.current?.clientWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return encounters.length > 0 ? (
    <DataTable rows={encounters} headers={headerData}>
      {({ rows, headers, getHeaderProps, getRowProps, getTableProps }) => {
        return (
          <TableContainer data-testid="encountersTable">
            <Table className={styles.customTable} {...getTableProps()} size={isDesktop(layout) ? 'sm' : 'md'}>
              <TableHead>
                <TableRow>
                  <TableExpandHeader />
                  {headers.map((header, i) =>
                    i === 0 ? (
                      <TableHeader id={`header_${visitUuid}_${i}`} ref={headerRef} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ) : (
                      <TableHeader id={`header_${visitUuid}_${i}`} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => (
                  <React.Fragment key={row.id}>
                    <TableExpandRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id} data-testid={cell.id}>
                          {cell.value}
                        </TableCell>
                      ))}
                    </TableExpandRow>
                    {row.isExpanded && (
                      <TableExpandedRow
                        className={styles.expandedRow}
                        style={{ paddingLeft: isDesktop(layout) ? '3rem' : '4rem' }}
                        colSpan={headers.length + 2}>
                        <div style={{ marginLeft: headerWidth }}>
                          <EncounterObservations observations={encounters[i].obs} />
                        </div>
                      </TableExpandedRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }}
    </DataTable>
  ) : (
    <div className={styles.encounterEmptyState}>
      <h4 className={styles.productiveHeading02}>{t('noEncountersFound', 'No encounters found')}</h4>
      <p className={classNames(styles.bodyLong01, styles.text02)}>
        {t('thereIsNoInformationToDisplayHere', 'There is no information to display here')}
      </p>
    </div>
  );
};

export default EncounterListDataTable;

import React from 'react';
import { Tile } from '@carbon/react';
import styles from './total-visits-tile.scss';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { type Visit } from '../types/index';

const useTotalVisits = () => {
  const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
  const currentVisitDate = dayjs(new Date().setHours(0, 0, 0, 0)).format(omrsDateFormat);
  const customRepresentation = 'custom:(uuid,startDatetime,stopDatetime)';

  const visitsUrl = `/ws/rest/v1/visit?includeInactive=true&v=${customRepresentation}&fromStartDate=${dayjs(
    currentVisitDate,
  ).format('YYYY-MM-DD')}`;

  const { data, error, isLoading } = useSWR<{ data: { results: Visit[] } }>(visitsUrl, openmrsFetch);

  const responseData = data?.data.results;

  return { data: responseData, error, isLoading };
};

const TotalVisitsTile: React.FC = () => {
  const { data: appointmentsData } = useTotalVisits();

  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Tile className={styles.tileContainer}>
        <div>
          <div className={styles.tileContent}>
            <div className={styles.tileHeader}>
              <header>{t('totalVisits', 'Total Visits Today')}</header>
            </div>
            <div className={styles.displayDetails}>
              <div>Patients</div>
              <div className={styles.displayData}>{appointmentsData?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </Tile>
    </React.Fragment>
  );
};

export default TotalVisitsTile;

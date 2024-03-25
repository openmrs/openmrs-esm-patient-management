import React from 'react';
import { Tile } from '@carbon/react';
import styles from './appointments-tile.scss';
import { useTranslation } from 'react-i18next';
import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import dayjs from 'dayjs';

const useAppointmentsData = () => {
  const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
  const appointmentDate = dayjs(new Date().setHours(0, 0, 0, 0)).format(omrsDateFormat);

  const url = `ws/rest/v1/appointment/all?forDate=${appointmentDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<any> }>(url, openmrsFetch);

  const responseData = data?.data;

  return { data: responseData, error, isLoading };
};

const AppointmentsTile: React.FC = () => {
  const { data: appointmentsData } = useAppointmentsData();

  const { t } = useTranslation();

  return (
    <React.Fragment>
      <Tile className={styles.tileContainer}>
        <div>
          <div className={styles.tileContent}>
            <div className={styles.tileHeader}>
              <header>{t('scheduledForToday', 'Scheduled For Today')}</header>
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

export default AppointmentsTile;

import React, { useContext } from 'react';
import classNames from 'classnames';
import styles from './monthly-workload.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { isSameMonth } from '../../helpers';
import dayjs, { type Dayjs } from 'dayjs';
import SelectedDateContext from '../../hooks/selectedDateContext';

interface MonthlyWorkloadComponentProps {
  date: Dayjs;
  count: number;
  isActive: boolean;
}

const MonthlyWorkloadCard: React.FC<MonthlyWorkloadComponentProps> = ({ date, count, isActive }) => {
  const layout = useLayoutType();
  const { t } = useTranslation();
  const { selectedDate } = useContext(SelectedDateContext);

  return (
    <div
      className={classNames(styles[isSameMonth(date, dayjs(selectedDate)) ? 'monthly-cell' : 'monthly-cell-disabled'], {
        [styles.smallDesktop]: layout === 'small-desktop',
        [styles.largeDesktop]: layout !== 'small-desktop',
      })}>
      <p>
        <b className={styles.calendarDate}>{date.format('D')}</b>
        <div className={styles.currentData}>
          <div tabIndex={0} role="button" className={classNames(styles.tileContainer, {})}></div>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={styles.serviceArea}>
            <span>{count}</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
            }}></div>
        </div>
      </p>
    </div>
  );
};
export default MonthlyWorkloadCard;

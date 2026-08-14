import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type DailyAppointmentsCountByService } from '../types';
import { getServiceTheme } from './utils/calendar-colors';
import styles from './services-legend.scss';

interface ServicesLegendProps {
  /* List of daily appointment counts grouped by service. */
  events: Array<DailyAppointmentsCountByService>;
}

/*
  Renders a bottom legend bar mapping appointment service names to their assigned color swatches.
  Used across calendar views (monthly, weekly, daily) to provide visual context for service color coding.
 */
const ServicesLegend: React.FC<ServicesLegendProps> = ({ events }) => {
  const { t } = useTranslation();

  const servicesLegendList = useMemo(() => {
    const legendMap = new Map<string, { serviceName: string; serviceUuid?: string }>();

    events?.forEach((event) => {
      event.services?.forEach((service) => {
        const key = service.serviceUuid || service.serviceName;
        if (service.serviceName && key && !legendMap.has(key)) {
          legendMap.set(key, { serviceName: service.serviceName, serviceUuid: service.serviceUuid });
        }
      });
    });

    return Array.from(legendMap.values());
  }, [events]);

  return (
    <div className={styles.servicesLegend}>
      {servicesLegendList.length > 0 && (
        <>
          <span className={styles.legendTitle}>{t('services', 'Services')}</span>
          <div className={styles.legendItems}>
            {servicesLegendList.map(({ serviceName, serviceUuid }) => {
              const theme = getServiceTheme(serviceUuid, serviceName);
              return (
                <div key={serviceUuid || serviceName} className={styles.legendItem}>
                  <span className={styles.swatch} style={{ backgroundColor: theme.swatch }} />
                  <span>{serviceName}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ServicesLegend;

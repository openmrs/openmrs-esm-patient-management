import React from 'react';
import { useTranslation } from 'react-i18next';
import { type AppointmentService } from '../types';
import styles from './services-legend.scss';

interface ServicesLegendProps {
  services: Array<{ uuid: string; name: string }>;
  serviceColorMap?: Map<string, string>;
}

/*
  Renders a bottom legend bar mapping appointment service names to their assigned color swatches.
  Used across calendar views (monthly, daily) to provide visual context for service color coding.
 */
const ServicesLegend: React.FC<ServicesLegendProps> = ({ services, serviceColorMap }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.servicesLegend}>
      {services.length > 0 && (
        <>
          <span className={styles.legendTitle}>{t('services', 'Services')}</span>
          <div className={styles.legendItems}>
            {services.map(({ name, uuid }) => {
              const color = serviceColorMap?.get(uuid);
              return (
                <div key={uuid} className={styles.legendItem}>
                  <span className={styles.swatch} style={{ backgroundColor: color }} />
                  <span>{name}</span>
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

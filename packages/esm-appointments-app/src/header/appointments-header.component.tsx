import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@carbon/react';
import { PageHeaderContainer, PageHeader, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import AppointmentsIllustration from './appointments-illustration.component';
import styles from './appointments-header.scss';
interface AppointmentHeaderProps {
  title: string;
  appointmentServiceType?: string;
  onChange?: (evt) => void;
}

const AppointmentsHeader: React.FC<AppointmentHeaderProps> = ({ title, appointmentServiceType, onChange }) => {
  const { t } = useTranslation();
  const { serviceTypes } = useAppointmentServices();
  const { clinicName, showIllustration } = useConfig<ConfigObject>();

  return (
    <PageHeaderContainer className={styles.header} data-testid="appointments-header">
      <PageHeader
        title={title}
        illustration={showIllustration ? <AppointmentsIllustration /> : null}
        clinicName={clinicName}
      />
      <div className={styles.dropdownContainer}>
        {typeof onChange === 'function' && (
          <Dropdown
            className={styles.dropdown}
            aria-label="Select service type"
            id="serviceDropdown"
            selectedItem={
              serviceTypes.find((service) => service.uuid === appointmentServiceType) || { name: 'All', uuid: '' }
            }
            items={[{ name: 'All', uuid: '' }, ...serviceTypes]}
            itemToString={(item) => (item ? item.name : '')}
            label={t('selectServiceType', 'Select service type')}
            type="inline"
            size="sm"
            direction="bottom"
            titleText={t('view', 'View')}
            onChange={({ selectedItem }) => onChange(selectedItem?.uuid)}
          />
        )}
      </div>
    </PageHeaderContainer>
  );
};

export default AppointmentsHeader;

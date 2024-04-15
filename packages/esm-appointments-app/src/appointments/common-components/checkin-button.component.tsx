import React from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchOverlay } from '../../hooks/useOverlay';
import VisitForm from '../../patient-queue/visit-form/visit-form.component';
import { type Appointment } from '../../types';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
dayjs.extend(utc);
dayjs.extend(isToday);

interface CheckInButtonProps {
  patientUuid: string;
  appointment: Appointment;
}

const CheckInButton: React.FC<CheckInButtonProps> = ({ appointment, patientUuid }) => {
  const { checkInButton } = useConfig<ConfigObject>();
  const { t } = useTranslation();
  return (
    <>
      {checkInButton.enabled &&
        (dayjs(appointment.startDateTime).isAfter(dayjs()) || dayjs(appointment.startDateTime).isToday()) && (
          <Button
            size="sm"
            kind="tertiary"
            onClick={() =>
              checkInButton.customUrl
                ? navigate({
                    to: checkInButton.customUrl,
                    templateParams: { patientUuid: appointment.patient.uuid, appointmentUuid: appointment.uuid },
                  })
                : launchOverlay(
                    t('patientSearch', 'Patient search'),
                    <VisitForm patientUuid={patientUuid} appointment={appointment} />,
                  )
            }>
            {t('checkIn', 'Check in')}
          </Button>
        )}
    </>
  );
};

export default CheckInButton;

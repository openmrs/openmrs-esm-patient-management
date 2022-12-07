import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointments } from './appointments-table.resource';
import AppointmentsBaseTable from './appointments-base-table.component';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useQueues } from '../patient-queue/visit-form/useVisit';
import { useSession } from '@openmrs/esm-framework';
import CommingSoon from '../empty-state/comming-soon.component';

interface ScheduledAppointmentsProps {
  visits: Array<any>;
  isLoading: boolean;
}
type scheduleType = 'cameEarly' | 'reScheduled' | 'honored' | 'notArrived' | 'scheduled';

const ScheduledAppointments: React.FC<ScheduledAppointmentsProps> = ({ isLoading: isLoadingVisit, visits }) => {
  const { t } = useTranslation();
  const session = useSession();
  const { queues } = useQueues(session?.sessionLocation?.uuid);
  const { appointments, isLoading } = useAppointments();
  const [scheduleType, setScheduleType] = useState<scheduleType>('scheduled');
  // console.log(visits);
  // Have an appointment and have a visit

  const cameEarlyAppointments = [];
  const reScheduledAppointment = [];
  // Have an appointment and do not have a visit
  const notArrivedAppointments = appointments?.filter(
    (appointment) => !visits.find((visit) => visit.patient.uuid === appointment.patientUuid),
  );
  const honouredAppointment = appointments?.filter((appointment) =>
    visits.find((visit) => visit.patient.uuid === appointment.patientUuid),
  );

  return (
    <div>
      <div style={{ padding: '0.425rem 0 0.25rem 1rem' }}>
        <ContentSwitcher style={{ maxWidth: '70%' }} size="sm" onChange={({ name }) => setScheduleType(name)}>
          <Switch name={'scheduled'} text={t('scheduled', 'Scheduled')} />
          <Switch name={'cameEarly'} text={t('cameEarly', 'Came Early')} />
          <Switch name={'reScheduled'} text={t('reScheduled', 'Rescheduled')} />
          <Switch name={'honored'} text={t('honored', 'Honored')} />
          <Switch name={'notArrived'} text={t('notArrived', 'Not Arrived')} />
        </ContentSwitcher>
      </div>
      {scheduleType === 'scheduled' && (
        <AppointmentsBaseTable
          appointments={appointments}
          isLoading={isLoading}
          tableHeading={t('scheduled', 'Scheduled')}
          visits={visits}
        />
      )}
      {scheduleType === 'cameEarly' && <CommingSoon />}
      {scheduleType === 'honored' && (
        <AppointmentsBaseTable
          appointments={honouredAppointment}
          isLoading={isLoading}
          tableHeading={t('honoured', 'Honoured')}
          visits={visits}
        />
      )}
      {scheduleType === 'reScheduled' && <CommingSoon />}
      {scheduleType === 'notArrived' && (
        <AppointmentsBaseTable
          appointments={notArrivedAppointments}
          isLoading={isLoading}
          tableHeading={t('notArrived', 'Not arrived')}
          visits={visits}
        />
      )}
    </div>
  );
};

export default ScheduledAppointments;

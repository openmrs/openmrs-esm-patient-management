import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import {
  FilterableMultiSelect,
  InlineLoading,
  InlineNotification,
  RadioButton,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react';
import { ErrorCard, formatDate, parseDate, showSnackbar, useConfig, type Visit } from '@openmrs/esm-framework';
import { changeAppointmentStatus, usePatientAppointments } from './patient-appointments.resource';
import { checkAppointmentConflict, saveAppointment, useAppointmentService } from '../form/appointments-form.resource';
import { useProviders } from '../hooks/useProviders';
import { type Appointment, type AppointmentPayload, type Provider } from '../types';
import { useMutateAppointments } from '../hooks/useMutateAppointments';
import { type ConfigObject } from '../config-schema';
import styles from './patient-upcoming-appointments-card.scss';

interface VisitFormCallbacks {
  onBeforeVisitCreate?: (context: {
    patientUuid: string;
    visitLocationUuid?: string;
    visitStartDatetime: Date | null;
    visitStatus: string;
  }) => Promise<void>;
  onVisitCreatedOrUpdated: (visit: Visit) => Promise<any>;
}

// See VisitFormExtensionState in esm-patient-chart-app
export interface PatientUpcomingAppointmentsProps {
  setVisitFormCallbacks(callbacks: VisitFormCallbacks);
  visitFormOpenedFrom: string;
  patientChartConfig?: {
    showUpcomingAppointments: boolean;
  };
  patientUuid: string;
}

/**
 * This is an extension that gets slotted into the patient chart start visit form when
 * the appropriate config values are enabled.
 * @param param0
 * @returns
 */
const PatientUpcomingAppointmentsCard: React.FC<PatientUpcomingAppointmentsProps> = ({
  patientUuid,
  setVisitFormCallbacks,
  patientChartConfig,
}) => {
  const { t } = useTranslation();
  const { appointmentFormDefaults, startVisitProviderSelection } = useConfig<ConfigObject>();
  const startDate = useMemo(() => dayjs().subtract(6, 'month').toISOString(), []);
  const headerTitle = t('upcomingAppointments', 'Upcoming appointments');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment>(null);
  const [selectedProviders, setSelectedProviders] = useState<Array<Provider>>([]);
  const [providerError, setProviderError] = useState<string | null>(null);
  const createdAppointmentUuidRef = useRef<string | null>(null);
  const { mutateAppointments } = useMutateAppointments();
  const { data: services } = useAppointmentService();
  const { providers, isLoading: isLoadingProviders, error: providersError } = useProviders();

  const ac = useMemo<AbortController>(() => new AbortController(), []);
  useEffect(() => () => ac.abort(), [ac]);
  const { data: appointmentsData, error, isLoading } = usePatientAppointments(patientUuid, startDate, ac);

  const showAppointmentError = useCallback(
    (subtitle: string) => {
      showSnackbar({
        title: t('appointmentFormError', 'Error scheduling appointment'),
        kind: 'error',
        isLowContrast: false,
        subtitle,
      });
    },
    [t],
  );

  const createAppointmentBeforeVisit = useCallback(
    async ({
      patientUuid,
      visitLocationUuid,
      visitStartDatetime,
    }: {
      patientUuid: string;
      visitLocationUuid?: string;
      visitStartDatetime: Date | null;
      visitStatus: string;
    }) => {
      createdAppointmentUuidRef.current = null;

      if (!startVisitProviderSelection.enabled || selectedAppointment || selectedProviders.length === 0) {
        return;
      }

      if (!visitLocationUuid) {
        const errorMessage = t('locationRequired', 'Location is required');
        showAppointmentError(errorMessage);
        return Promise.reject(new Error(errorMessage));
      }

      const configuredService =
        services?.find((service) => service.name === appointmentFormDefaults.serviceName) ??
        (services?.length === 1 ? services[0] : undefined);

      if (!configuredService) {
        const errorMessage = t(
          'defaultServiceNotFound',
          'The configured default appointment service could not be found',
        );
        showAppointmentError(errorMessage);
        return Promise.reject(new Error(errorMessage));
      }

      const appointmentStartDateTime = dayjs(visitStartDatetime ?? new Date());
      const durationMins =
        configuredService.durationMins && configuredService.durationMins > 0
          ? configuredService.durationMins
          : appointmentFormDefaults.fallbackDurationMins;
      const appointmentPayload: AppointmentPayload = {
        patientUuid,
        serviceUuid: configuredService.uuid,
        dateAppointmentScheduled: dayjs().format(),
        startDateTime: appointmentStartDateTime.format(),
        endDateTime: appointmentStartDateTime.add(durationMins, 'minute').format(),
        appointmentKind: appointmentFormDefaults.appointmentType,
        providers: selectedProviders.map(({ uuid }) => ({ uuid })),
        locationUuid: visitLocationUuid,
        comments: '',
      };

      const conflictResponse = await checkAppointmentConflict(appointmentPayload);
      if (conflictResponse?.data?.hasOwnProperty('SERVICE_UNAVAILABLE')) {
        const errorMessage = t('serviceUnavailable', 'Appointment time is outside of service hours');
        showSnackbar({ isLowContrast: true, kind: 'error', title: errorMessage });
        return Promise.reject(new Error(errorMessage));
      }

      if (conflictResponse?.data?.hasOwnProperty('PATIENT_DOUBLE_BOOKING')) {
        const errorMessage = t('patientDoubleBooking', 'Patient already booked for an appointment at this time');
        showSnackbar({ isLowContrast: true, kind: 'error', title: errorMessage });
        return Promise.reject(new Error(errorMessage));
      }

      const response = await saveAppointment(appointmentPayload, new AbortController()).catch((error) => {
        showAppointmentError(error?.message);
        return Promise.reject(error);
      });

      createdAppointmentUuidRef.current = response?.data?.uuid;
    },
    [
      appointmentFormDefaults.appointmentType,
      appointmentFormDefaults.fallbackDurationMins,
      appointmentFormDefaults.serviceName,
      selectedAppointment,
      selectedProviders,
      services,
      showAppointmentError,
      startVisitProviderSelection.enabled,
      t,
    ],
  );

  const checkInSelectedAppointment = useCallback(() => {
    const appointmentUuidToCheckIn = selectedAppointment?.uuid ?? createdAppointmentUuidRef.current;

    if (!appointmentUuidToCheckIn) {
      return Promise.resolve();
    }

    return changeAppointmentStatus('CheckedIn', appointmentUuidToCheckIn)
      .then(() => {
        mutateAppointments();
        showSnackbar({
          isLowContrast: true,
          kind: 'success',
          subtitle: t('appointmentMarkedChecked', 'Appointment marked as Checked In'),
          title: t('appointmentCheckedIn', 'Appointment Checked In'),
        });
      })
      .catch((error) => {
        showSnackbar({
          title: t('updateError', 'Error updating upcoming appointment'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      });
  }, [mutateAppointments, selectedAppointment, t]);

  useEffect(() => {
    if (startVisitProviderSelection.required && selectedProviders.length === 0) {
      setProviderError(t('providerRequired', 'Provider is required'));
      return;
    }

    setProviderError(null);
  }, [selectedProviders, startVisitProviderSelection.required, t]);

  useEffect(() => {
    setVisitFormCallbacks({
      onBeforeVisitCreate: createAppointmentBeforeVisit,
      onVisitCreatedOrUpdated: checkInSelectedAppointment,
    });
  }, [checkInSelectedAppointment, createAppointmentBeforeVisit, setVisitFormCallbacks]);

  const todaysAppointments = appointmentsData?.todaysAppointments?.length ? appointmentsData?.todaysAppointments : [];
  const futureAppointments = appointmentsData?.upcomingAppointments?.length
    ? appointmentsData?.upcomingAppointments
    : [];

  const appointments = todaysAppointments
    .concat(futureAppointments)
    .filter(
      (appointment) =>
        appointment.status !== 'CheckedIn' &&
        appointment.status !== 'Cancelled' &&
        appointment.status !== 'Completed' &&
        appointment.status !== 'Missed',
    );

  const handleRadioChange = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedProviders([]);
    setProviderError(null);
  };

  const handleProviderChange = ({ selectedItems }: { selectedItems: Array<Provider> }) => {
    setSelectedAppointment(null);
    setSelectedProviders(selectedItems);
    setProviderError(null);
  };

  if (!patientChartConfig.showUpcomingAppointments) {
    return null;
  }

  if (error) {
    return <ErrorCard headerTitle={headerTitle} error={error} />;
  }

  if (isLoading) {
    return (
      <span>
        <InlineLoading />
      </span>
    );
  }

  if (appointments.length) {
    return (
      <div>
        <div>
          <p className={styles.sectionTitle}>{headerTitle}</p>
          <span className={styles.headerLabel}>{t('appointmentToFulfill', 'Select appointment to fulfill')}</span>
        </div>
        <StructuredListWrapper>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{t('date', 'Date')}</StructuredListCell>
              <StructuredListCell head>{t('appointmentType', 'Appointment type')}</StructuredListCell>
              <StructuredListCell head>{t('action', 'Action')}</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>
          <StructuredListBody>
            {appointments.map((appointment, index) => (
              <StructuredListRow key={index} className={styles.structuredList}>
                <StructuredListCell>
                  {formatDate(parseDate(appointment.startDateTime), { mode: 'wide' })}
                </StructuredListCell>
                <StructuredListCell>{appointment.service ? appointment.service.name : '——'}</StructuredListCell>
                <StructuredListCell>
                  <RadioButton
                    className={styles.radioButton}
                    hideLabel
                    labelText={appointment.service?.name || t('appointment', 'Appointment')}
                    id={`radio-${index}`}
                    name="appointmentRadio"
                    value={appointment.uuid}
                    checked={selectedAppointment === appointment}
                    onChange={() => handleRadioChange(appointment)}
                  />
                </StructuredListCell>
              </StructuredListRow>
            ))}
          </StructuredListBody>
        </StructuredListWrapper>
      </div>
    );
  }

  return (
    <div>
      {startVisitProviderSelection.enabled ? (
        <>
          <div>
            <p className={styles.sectionTitle}>{t('provider', 'Provider')}</p>
            <span className={styles.headerLabel}>
              {t('selectProviderForVisit', 'Select one or more providers for this visit')}
            </span>
          </div>
          {isLoadingProviders ? (
            <span>
              <InlineLoading />
            </span>
          ) : providersError ? (
            <InlineNotification
              className={styles.inlineNotification}
              kind="error"
              lowContrast
              subtitle={t('errorLoadingProviders', 'Error loading providers')}
              title={t('provider', 'Provider')}
            />
          ) : (
            <div className={styles.sectionField}>
              <FilterableMultiSelect
                id="visit-provider-selection"
                items={providers ?? []}
                itemToString={(item) => item?.display ?? ''}
                onChange={handleProviderChange}
                placeholder={t('chooseProvider', 'Choose a provider')}
                titleText={t('selectProvider', 'Select provider')}
                selectionFeedback="top-after-reopen"
              />
              {selectedProviders.length > 0 && (
                <p className={styles.selectedItemsSummary}>
                  {selectedProviders
                    .map((provider) => provider?.display)
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          )}
          {providerError && (
            <InlineNotification
              className={styles.inlineNotification}
              kind="error"
              lowContrast
              subtitle={providerError}
              title={t('providerRequiredTitle', 'Provider required')}
            />
          )}
        </>
      ) : (
        <InlineNotification
          className={styles.inlineNotification}
          kind="info"
          lowContrast
          subtitle={t('noUpcomingAppointments', 'No upcoming appointments found')}
          title={t('upcomingAppointments', 'Upcoming appointments')}
        />
      )}
    </div>
  );
};

export default PatientUpcomingAppointmentsCard;

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  FormGroup,
  Select,
  SelectItem,
  Button,
  NumberInput,
  Toggle,
  Checkbox,
  TimePicker,
  Stack,
  ButtonSet,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ResponsiveWrapper, useLayoutType } from '@openmrs/esm-framework';
import { useAppointmentService } from '../form/appointments-form.resource';
import styles from '../form/appointments-form.scss';
import { updateAppointmentService } from '../hooks/useAppointmentsCalendar';
import { getWeekDays } from '../types';

type WeeklyAvailabilityDay = {
  startTime?: string;
  endTime?: string;
  maxAppointmentsLimit?: number | null;
};

type AppointmentServiceFormType = {
  selectedService: string;
  maxAppointmentsLimit: string;
  weeklyAvailability: {
    [key: string]: WeeklyAvailabilityDay;
  };
};

function formatTimeWithSeconds(time: string): string {
  if (!time) return '';
  if (time.length === 8 && time.split(':').length === 3) return time;
  if (time.length === 5 && time.split(':').length === 2) return `${time}:00`;
  return time;
}

function buildServicePayload(data: AppointmentServiceFormType, serviceData: any): any {
  const maxAppointmentsLimit =
    data.maxAppointmentsLimit === '' || data.maxAppointmentsLimit == null ? null : Number(data.maxAppointmentsLimit);

  const weeklyAvailability = Object.entries(data.weeklyAvailability || {})
    .map(([day, value]) => ({
      dayOfWeek: day,
      startTime: formatTimeWithSeconds(value.startTime || ''),
      endTime: formatTimeWithSeconds(value.endTime || ''),
      maxAppointmentsLimit: value.maxAppointmentsLimit == null ? null : Number(value.maxAppointmentsLimit),
    }))
    .filter((entry) => entry.startTime && entry.endTime);

  let rootStartTime = serviceData.startTime || '';
  let rootEndTime = serviceData.endTime || '';

  if (weeklyAvailability.length > 0) {
    rootStartTime = weeklyAvailability[0].startTime;
    rootEndTime = weeklyAvailability[0].endTime;
  }

  return {
    name: data.selectedService,
    maxAppointmentsLimit,
    startTime: rootStartTime,
    endTime: rootEndTime,
    weeklyAvailability,
  };
}

function handleUpdateError(error: any, serviceName: string): void {
  const errorMessage = error?.message || 'Failed to update appointment service';
  let alertMessage = `${errorMessage}\n\nService: "${serviceName}"`;
  alert(alertMessage);
}

function handleUpdateSuccess(serviceName: string, responseData: any, originalUuid: string): void {
  const metadata = responseData?._metadata;
}

export const AppointmentServiceForm: React.FC<{ closeWorkspace?: (arg?: any) => void }> = ({ closeWorkspace }) => {
  const handleClose = () => {
    if (typeof closeWorkspace === 'function') {
      closeWorkspace(undefined);
    } else if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({ type: 'close-workspace' }, '*');
    }
  };

  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const weekDays = getWeekDays(t);
  const time12HourFormatRegexPattern = '^(1[0-2]|0?[1-9]):[0-5][0-9]$';

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<AppointmentServiceFormType>({
    defaultValues: {
      selectedService: '',
      maxAppointmentsLimit: '',
      weeklyAvailability: {},
    },
  });

  const { data: services, isLoading, mutate: mutateServices } = useAppointmentService();

  const fetchServiceData = (serviceName: string) => {
    return (
      services?.find((s) => s.name === serviceName) || {
        appointmentServiceId: 0,
        name: serviceName,
        description: null,
        speciality: {},
        startTime: '',
        endTime: '',
        maxAppointmentsLimit: null,
        durationMins: null,
        location: {},
        uuid: '',
        color: styles.defaultServiceColor || '#e2e2e2',
        initialAppointmentStatus: null,
        creatorName: null,
        weeklyAvailability: [],
        serviceTypes: [],
      }
    );
  };

  const onSubmit = async (data: AppointmentServiceFormType) => {
    const serviceData = fetchServiceData(data.selectedService);
    const payload = buildServicePayload(data, serviceData);

    setIsSubmitting(true);
    const result = await updateAppointmentService(serviceData.uuid, payload);
    setIsSubmitting(false);

    if (!result.success) {
      handleUpdateError(result.error, data.selectedService);
      return;
    }

    handleUpdateSuccess(data.selectedService, result.data, serviceData.uuid);
    await mutateServices();
    handleClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack className={styles.formWrapper} gap={6}>
        <FormGroup className={styles.formGroup} legendText={t('service', 'Service')}>
          <ResponsiveWrapper>
            <Controller
              name="selectedService"
              control={control}
              rules={{ required: 'Service is required' }}
              render={({ field: { onBlur, onChange, value, ref } }) => (
                <Select
                  id="service"
                  invalid={!!errors?.selectedService}
                  invalidText={errors?.selectedService?.message}
                  labelText={t('selectService', 'Select a service')}
                  onBlur={onBlur}
                  onChange={onChange}
                  ref={ref}
                  value={value}>
                  <SelectItem text={t('chooseService', 'Select service')} value="" />
                  {services?.map((service) => (
                    <SelectItem key={service.uuid} text={service.name} value={service.name} />
                  ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>
        </FormGroup>
        <FormGroup className={styles.formGroup} legendText={t('maxAppointmentsLimit', 'Max Appointments Limit')}>
          <ResponsiveWrapper>
            <Controller
              name="maxAppointmentsLimit"
              control={control}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <NumberInput
                  allowEmpty
                  disableWheel
                  hideSteppers
                  id="maxAppointmentsLimit"
                  invalid={!!errors?.maxAppointmentsLimit}
                  invalidText={errors?.maxAppointmentsLimit?.message}
                  label={t('maxAppointmentsLimit', 'Max Appointments Limit')}
                  onBlur={onBlur}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onChange(event.target.value === '' ? null : Number(event.target.value))
                  }
                  ref={ref}
                  value={value ?? ''}
                />
              )}
            />
          </ResponsiveWrapper>
        </FormGroup>
        <FormGroup className={styles.formGroup} legendText={t('weeklyAvailability', 'Weekly Availability')}>
          <Toggle
            id="weeklyAvailabilityToggle"
            labelA={t('no', 'No')}
            labelB={t('yes', 'Yes')}
            labelText={t('enableWeeklyAvailability', 'Enable weekly availability?')}
            toggled={weeklyEnabled}
            onToggle={() => {
              setWeeklyEnabled((prev) => {
                if (prev) {
                  setValue('weeklyAvailability', {});
                  setSelectedDays([]);
                }
                return !prev;
              });
            }}
          />

          {weeklyEnabled && (
            <div className={styles.weeklyAvailabilityContainer}>
              {weekDays.map((day) => (
                <Checkbox
                  key={day.id}
                  id={day.id}
                  labelText={day.label}
                  checked={selectedDays.includes(day.id)}
                  onChange={(event, { checked }) => {
                    setSelectedDays((prev) => {
                      if (checked) {
                        return prev.includes(day.id) ? prev : [...prev, day.id];
                      } else {
                        const wa = { ...getValues('weeklyAvailability') };
                        delete wa[day.id];
                        setValue('weeklyAvailability', wa);
                        return prev.filter((d) => d !== day.id);
                      }
                    });
                  }}
                />
              ))}
              <Stack className={styles.formWrapper} gap={1}>
                {selectedDays.map((day) => (
                  <div key={day} className={styles.daySection}>
                    <span className={styles.dayLabel}>{weekDays.find((d) => d.id === day)?.label}</span>
                    <div className={styles.dayFieldsContainer}>
                      <div className={styles.timePickerWrapper}>
                        <ResponsiveWrapper>
                          <Controller
                            name={`weeklyAvailability.${day}.startTime`}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <TimePicker
                                id={`startTime-${day}`}
                                pattern={time12HourFormatRegexPattern}
                                labelText={t('startTime', 'Start Time')}
                                onChange={(event) => onChange(event.target.value)}
                                value={value || ''}
                              />
                            )}
                          />
                        </ResponsiveWrapper>
                      </div>
                      <div className={styles.timePickerWrapper}>
                        <ResponsiveWrapper>
                          <Controller
                            name={`weeklyAvailability.${day}.endTime`}
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <TimePicker
                                id={`endTime-${day}`}
                                pattern={time12HourFormatRegexPattern}
                                labelText={t('endTime', 'End Time')}
                                onChange={(event) => onChange(event.target.value)}
                                value={value || ''}
                              />
                            )}
                          />
                        </ResponsiveWrapper>
                      </div>
                      <div className={styles.maxAppointmentsWrapper}>
                        <ResponsiveWrapper>
                          <Controller
                            name={`weeklyAvailability.${day}.maxAppointmentsLimit`}
                            control={control}
                            render={({ field: { onChange, onBlur, value, ref } }) => (
                              <NumberInput
                                allowEmpty
                                disableWheel
                                hideSteppers
                                id={`dayLimit-${day}`}
                                label={t('maxAppointmentsLimit', 'Max Appointments')}
                                onBlur={onBlur}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                  onChange(event.target.value === '' ? null : Number(event.target.value))
                                }
                                ref={ref}
                                value={value ?? ''}
                                placeholder="Day limit"
                              />
                            )}
                          />
                        </ResponsiveWrapper>
                      </div>
                    </div>
                  </div>
                ))}
              </Stack>
            </div>
          )}
        </FormGroup>
      </Stack>
      <div className={styles.formFooter}>
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button className={styles.button} onClick={handleClose} kind="secondary">
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} disabled={isSubmitting} type="submit">
            {isSubmitting ? t('saving', 'Saving...') : t('saveAndClose', 'Save and close')}
          </Button>
        </ButtonSet>
      </div>
    </form>
  );
};

export default AppointmentServiceForm;

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Controller, useController, useForm, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Form,
  FormGroup,
  InlineLoading,
  MultiSelect,
  NumberInput,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TimePicker,
  TimePickerSelect,
  Toggle,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ExtensionSlot,
  OpenmrsDatePicker,
  OpenmrsDateRangePicker,
  ResponsiveWrapper,
  showSnackbar,
  translateFrom,
  useConfig,
  useLayoutType,
  useLocations,
  usePatient,
  useSession,
  Workspace2,
  type Workspace2DefinitionProps,
  type FetchResponse,
} from '@openmrs/esm-framework';
import { z } from 'zod';
import { type ConfigObject } from '../config-schema';
import type { Appointment, AppointmentPayload, RecurringPattern } from '../types';
import {
  checkAppointmentConflict,
  saveAppointment,
  saveRecurringAppointments,
  useAppointmentService,
  useMutateAppointments,
} from './appointments-form.resource';
import { appointmentLocationTagName, dateFormat, moduleName, weekDays } from '../constants';
import { useAppointmentsStore } from '../store';
import { useProviders } from '../hooks/useProviders';
import Workload from '../workload/workload.component';
import styles from './appointments-form.scss';

interface AppointmentsFormProps {
  appointment?: Appointment;
  recurringPattern?: RecurringPattern;
  patientUuid: string;
}

const time12HourFormatRegexPattern = '^(1[0-2]|0?[1-9]):[0-5][0-9]$';
const time12HourFormatRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9]$/;

const isValidTime = (timeStr: string) => time12HourFormatRegex.test(timeStr);

/**
 * Workspace used to create or edit an appointment within the appointments app
 */
const AppointmentsForm: React.FC<Workspace2DefinitionProps<AppointmentsFormProps>> = ({
  workspaceProps: { appointment, recurringPattern, patientUuid },
  closeWorkspace,
}) => {
  const { patient } = usePatient(patientUuid);
  const { mutateAppointments } = useMutateAppointments();
  const editedAppointmentTimeFormat = new Date(appointment?.startDateTime).getHours() >= 12 ? 'PM' : 'AM';
  const defaultTimeFormat = appointment?.startDateTime
    ? editedAppointmentTimeFormat
    : new Date().getHours() >= 12
      ? 'PM'
      : 'AM';
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations(appointmentLocationTagName);
  const providers = useProviders();
  const session = useSession();
  const { selectedDate } = useAppointmentsStore();
  const { data: services, isLoading } = useAppointmentService();
  const { appointmentStatuses, appointmentTypes, allowAllDayAppointments } = useConfig<ConfigObject>();

  const [isRecurringAppointment, setIsRecurringAppointment] = useState(false);
  const defaultRecurringPatternType = recurringPattern?.type || 'DAY';
  const defaultRecurringPatternPeriod = recurringPattern?.period || 1;
  const defaultRecurringPatternDaysOfWeek = recurringPattern?.daysOfWeek || [];
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO can we clean this all up to be more consistent between using Date and dayjs?
  const defaultStartDate = appointment?.startDateTime
    ? new Date(appointment?.startDateTime)
    : selectedDate
      ? new Date(selectedDate)
      : new Date();
  const defaultEndDate = recurringPattern?.endDate ? new Date(recurringPattern?.endDate) : null;
  const defaultEndDateText = recurringPattern?.endDate
    ? dayjs(new Date(recurringPattern.endDate)).format(dateFormat)
    : '';
  const defaultStartDateText = appointment?.startDateTime
    ? dayjs(new Date(appointment.startDateTime)).format(dateFormat)
    : selectedDate
      ? dayjs(selectedDate).format(dateFormat)
      : dayjs(new Date()).format(dateFormat);

  const defaultAppointmentStartTime = appointment?.startDateTime
    ? dayjs(new Date(appointment?.startDateTime)).format('hh:mm')
    : dayjs(new Date()).format('hh:mm');

  const defaultDuration =
    appointment?.startDateTime && appointment?.endDateTime
      ? dayjs(appointment.endDateTime).diff(dayjs(appointment.startDateTime), 'minutes')
      : undefined;

  // t('durationErrorMessage', 'Duration should be greater than zero')
  const appointmentsFormSchema = z
    .object({
      duration: z.union([z.number(), z.null()]).optional(),
      isAllDayAppointment: z.boolean(),
      location: z.string().refine((value) => value !== '', {
        message: translateFrom(moduleName, 'locationRequired', 'Location is required'),
      }),
      provider: z.string().refine((value) => value !== '', {
        message: translateFrom(moduleName, 'providerRequired', 'Provider is required'),
      }),
      appointmentStatus: z.string().optional(),
      appointmentNote: z.string(),
      appointmentType: z.string().refine((value) => value !== '', {
        message: translateFrom(moduleName, 'appointmentTypeRequired', 'Appointment type is required'),
      }),
      selectedService: z.string().refine((value) => value !== '', {
        message: translateFrom(moduleName, 'serviceRequired', 'Service is required'),
      }),
      recurringPatternType: z.enum(['DAY', 'WEEK']),
      recurringPatternPeriod: z.number(),
      recurringPatternDaysOfWeek: z.array(z.string()),
      selectedDaysOfWeekText: z.string().optional(),
      startTime: z.string().refine((value) => isValidTime(value), {
        message: translateFrom(moduleName, 'invalidTime', 'Invalid time'),
      }),
      timeFormat: z.enum(['AM', 'PM']),
      appointmentDateTime: z.object({
        startDate: z.date(),
        startDateText: z.string(),
        recurringPatternEndDate: z.date().nullable(),
        recurringPatternEndDateText: z.string().nullable(),
      }),
      formIsRecurringAppointment: z.boolean(),
      dateAppointmentScheduled: z.date().optional(),
    })
    .refine(
      (formValues) => {
        if (formValues.formIsRecurringAppointment === true) {
          return z.date().safeParse(formValues.appointmentDateTime.recurringPatternEndDate).success;
        }
        return true;
      },
      {
        path: ['appointmentDateTime.recurringPatternEndDate'],
        message: t('recurringAppointmentShouldHaveEndDate', 'A recurring appointment should have an end date'),
      },
    )
    .refine(
      (formValues) => {
        const { appointmentDateTime, dateAppointmentScheduled } = formValues;

        const startDate = appointmentDateTime?.startDate;

        if (!startDate || !dateAppointmentScheduled) return true;

        const normalizeDate = (date: Date) => {
          const normalizedDate = new Date(date);
          normalizedDate.setHours(0, 0, 0, 0);
          return normalizedDate;
        };

        const startDateObj = normalizeDate(startDate);
        const scheduledDateObj = normalizeDate(dateAppointmentScheduled);

        return scheduledDateObj <= startDateObj;
      },
      {
        path: ['dateAppointmentScheduled'],
        message: t(
          'dateAppointmentIssuedCannotBeAfterAppointmentDate',
          'Date appointment issued cannot be after the appointment date',
        ),
      },
    )
    .superRefine((data, ctx) => {
      // If not all-day, duration must be > 0 and <= 1440 minutes (24 hours)
      if (!data.isAllDayAppointment && (!data.duration || data.duration <= 0)) {
        ctx.addIssue({
          path: ['duration'],
          code: z.ZodIssueCode.custom,
          message: translateFrom(moduleName, 'durationErrorMessage', 'Duration should be greater than zero'),
        });
      }
      if (!data.isAllDayAppointment && data.duration && data.duration > 1440) {
        ctx.addIssue({
          path: ['duration'],
          code: z.ZodIssueCode.custom,
          message: translateFrom(
            moduleName,
            'durationMaxErrorMessage',
            'Duration cannot exceed 1440 minutes (24 hours)',
          ),
        });
      }
    });

  type AppointmentFormData = z.infer<typeof appointmentsFormSchema>;

  const defaultDateAppointmentScheduled = appointment?.dateAppointmentScheduled
    ? new Date(appointment?.dateAppointmentScheduled)
    : new Date();

  const {
    control,
    getValues,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AppointmentFormData>({
    mode: 'all',
    resolver: zodResolver(appointmentsFormSchema),
    defaultValues: {
      location: appointment?.location?.uuid ?? session?.sessionLocation?.uuid ?? '',
      provider:
        appointment?.providers?.find((provider) => provider.response === 'ACCEPTED')?.uuid ??
        session?.currentProvider?.uuid ??
        '', // assumes only a single previously-scheduled provider with state "ACCEPTED", if multiple, just takes the first
      appointmentNote: appointment?.comments || '',
      appointmentStatus: appointment?.status || '',
      appointmentType: appointment?.appointmentKind || (appointmentTypes?.length === 1 ? appointmentTypes[0] : ''),
      selectedService: appointment?.service?.name || (services?.length === 1 ? services[0].name : ''),
      recurringPatternType: defaultRecurringPatternType,
      recurringPatternPeriod: defaultRecurringPatternPeriod,
      recurringPatternDaysOfWeek: defaultRecurringPatternDaysOfWeek,
      startTime: defaultAppointmentStartTime,
      duration: defaultDuration,
      timeFormat: defaultTimeFormat,
      appointmentDateTime: {
        startDate: defaultStartDate,
        startDateText: defaultStartDateText,
        recurringPatternEndDate: defaultEndDate,
        recurringPatternEndDateText: defaultEndDateText,
      },
      formIsRecurringAppointment: isRecurringAppointment,
      dateAppointmentScheduled: defaultDateAppointmentScheduled,
      isAllDayAppointment: allowAllDayAppointments,
    },
  });

  useEffect(() => setValue('formIsRecurringAppointment', isRecurringAppointment), [isRecurringAppointment, setValue]);

  // Retrieve ref callback for appointmentDateTime (startDate & recurringPatternEndDate)
  const {
    field: { ref: startDateRef },
  } = useController({ name: 'appointmentDateTime.startDate', control });
  const {
    field: { ref: endDateRef },
  } = useController({ name: 'appointmentDateTime.recurringPatternEndDate', control });

  // Manually call ref callback from 'react-hook-form' with the element(s) we want to be focused
  useEffect(() => {
    const startDateElement = document.getElementById('startDatePickerInput');
    const endDateElement = document.getElementById('endDatePickerInput');
    startDateRef(startDateElement);
    endDateRef(endDateElement);
  }, [startDateRef, endDateRef]);

  useEffect(() => {
    if (isSuccessful) {
      reset();
      closeWorkspace({ discardUnsavedChanges: true, closeWindow: true });
    }
  }, [isSuccessful, reset, closeWorkspace]);

  const handleWorkloadDateChange = (date: Date) => {
    const appointmentDate = getValues('appointmentDateTime');
    setValue('appointmentDateTime', { ...appointmentDate, startDate: date });
  };

  const handleSelectChange = (e) => {
    setValue(
      'selectedDaysOfWeekText',
      (() => {
        if (e?.selectedItems?.length < 1) {
          return t('daysOfWeek', 'Days of the week');
        } else {
          return e.selectedItems
            .map((weekDay) => {
              return weekDay.label;
            })
            .join(', ');
        }
      })(),
    );
    setValue(
      'recurringPatternDaysOfWeek',
      e.selectedItems.map((s) => {
        return s.id;
      }),
    );
  };

  const defaultSelectedDaysOfWeekText: string = (() => {
    if (getValues('recurringPatternDaysOfWeek')?.length < 1) {
      return t('daysOfWeek', 'Days of the week');
    } else {
      return weekDays
        .filter((weekDay) => getValues('recurringPatternDaysOfWeek').includes(weekDay.id))
        .map((weekDay) => {
          return weekDay.label;
        })
        .join(', ');
    }
  })();

  const isEditing = Boolean(appointment);

  // Same for creating and editing
  const handleSaveAppointment = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    // Construct appointment payload
    const appointmentPayload = constructAppointmentPayload(data);

    // Check if a duplicate response occurs
    const response: FetchResponse = await checkAppointmentConflict(appointmentPayload);
    let errorMessage = t('appointmentConflict', 'Appointment conflict');
    if (response?.data?.hasOwnProperty('SERVICE_UNAVAILABLE')) {
      errorMessage = t('serviceUnavailable', 'Appointment time is outside of service hours');
    } else if (response?.data?.hasOwnProperty('PATIENT_DOUBLE_BOOKING')) {
      errorMessage = t('patientDoubleBooking', 'Patient already booked for an appointment at this time');
    }

    if (response.status === 200 && errorMessage) {
      setIsSubmitting(false);
      showSnackbar({
        isLowContrast: true,
        kind: 'error',
        title: errorMessage,
      });
      return;
    }

    // Construct recurring pattern payload
    const recurringAppointmentPayload = {
      appointmentRequest: appointmentPayload,
      recurringPattern: constructRecurringPattern(data),
    };

    const abortController = new AbortController();

    (isRecurringAppointment
      ? saveRecurringAppointments(recurringAppointmentPayload, abortController)
      : saveAppointment(appointmentPayload, abortController)
    ).then(
      ({ status }) => {
        if (status === 200) {
          setIsSubmitting(false);
          setIsSuccessful(true);
          mutateAppointments();
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            subtitle: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: isEditing
              ? t('appointmentEdited', 'Appointment edited')
              : t('appointmentScheduled', 'Appointment scheduled'),
          });
        }
        if (status === 204) {
          setIsSubmitting(false);
          showSnackbar({
            title: isEditing
              ? t('appointmentEditError', 'Error editing appointment')
              : t('appointmentFormError', 'Error scheduling appointment'),
            kind: 'error',
            isLowContrast: false,
            subtitle: t('noContent', 'No Content'),
          });
        }
      },
      (error) => {
        setIsSubmitting(false);
        showSnackbar({
          title: isEditing
            ? t('appointmentEditError', 'Error editing appointment')
            : t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  };

  const constructAppointmentPayload = (data: AppointmentFormData): AppointmentPayload => {
    const {
      selectedService,
      startTime,
      timeFormat,
      appointmentDateTime: { startDate },
      duration,
      appointmentType: selectedAppointmentType,
      location,
      provider,
      appointmentNote,
      appointmentStatus,
      dateAppointmentScheduled,
      isAllDayAppointment,
    } = data;

    const serviceUuid = services?.find((service) => service.name === selectedService)?.uuid;
    const hoursAndMinutes = startTime.split(':').map((item) => parseInt(item, 10));
    const hours = (hoursAndMinutes[0] % 12) + (timeFormat === 'PM' ? 12 : 0);
    const minutes = hoursAndMinutes[1];
    const startDatetime = startDate.setHours(hours, minutes);
    const endDatetime = isAllDayAppointment
      ? dayjs(startDate).endOf('day').toDate()
      : dayjs(startDatetime).add(duration, 'minutes').toDate();

    return {
      appointmentKind: selectedAppointmentType,
      status: appointmentStatus,
      serviceUuid: serviceUuid,
      startDateTime: dayjs(startDatetime).format(),
      endDateTime: dayjs(endDatetime).format(),
      locationUuid: location,
      providers: [{ uuid: provider }],
      patientUuid: patientUuid,
      comments: appointmentNote,
      uuid: isEditing ? appointment.uuid : undefined,
      dateAppointmentScheduled: dayjs(dateAppointmentScheduled).format(),
    };
  };

  const constructRecurringPattern = (data: AppointmentFormData): RecurringPattern => {
    const {
      appointmentDateTime: { recurringPatternEndDate },
      recurringPatternType,
      recurringPatternPeriod,
      recurringPatternDaysOfWeek,
    } = data;

    const [hours, minutes] = [23, 59];
    const endDate = recurringPatternEndDate?.setHours(hours, minutes);

    return {
      type: recurringPatternType,
      period: recurringPatternPeriod,
      endDate: endDate ? dayjs(endDate).format() : null,
      daysOfWeek: recurringPatternDaysOfWeek,
    };
  };

  const title = isEditing
    ? t('editAppointment', 'Edit appointment')
    : t('createNewAppointment', 'Create new appointment');

  if (isLoading) {
    return (
      <Workspace2 title={title}>
        <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} role="progressbar" />
      </Workspace2>
    );
  }

  return (
    <Workspace2 title={title} hasUnsavedChanges={isDirty}>
      <Form onSubmit={handleSubmit(handleSaveAppointment)}>
        {patient && (
          <ExtensionSlot
            name="patient-header-slot"
            state={{
              patient,
              patientUuid: patientUuid,
              hideActionsOverflow: true,
            }}
          />
        )}
        <Stack className={styles.formWrapper} gap={6}>
          <FormGroup className={styles.formGroup} legendText={t('location', 'Location')}>
            <ResponsiveWrapper>
              <Controller
                name="location"
                control={control}
                render={({ field: { onChange, value, onBlur, ref } }) => (
                  <Select
                    id="location"
                    invalid={!!errors?.location}
                    invalidText={errors?.location?.message}
                    labelText={t('selectALocation', 'Select a location')}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={ref}
                    value={value}>
                    <SelectItem text={t('chooseLocation', 'Choose a location')} value="" />
                    {locations?.length > 0 &&
                      locations.map((location) => (
                        <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                          {location.display}
                        </SelectItem>
                      ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>
          <FormGroup className={styles.formGroup} legendText={t('service', 'Service')}>
            <ResponsiveWrapper>
              <Controller
                name="selectedService"
                control={control}
                render={({ field: { onBlur, onChange, value, ref } }) => (
                  <Select
                    id="service"
                    invalid={!!errors?.selectedService}
                    invalidText={errors?.selectedService?.message}
                    labelText={t('selectService', 'Select a service')}
                    onBlur={onBlur}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                      if (!isEditing) {
                        setValue(
                          'duration',
                          services?.find((service) => service.name === event.target.value)?.durationMins,
                        );
                      } else {
                        const previousServiceDuration = services?.find(
                          (service) => service.name === getValues('selectedService'),
                        )?.durationMins;
                        const selectedServiceDuration = services?.find(
                          (service) => service.name === event.target.value,
                        )?.durationMins;
                        if (selectedServiceDuration && previousServiceDuration === getValues('duration')) {
                          setValue('duration', selectedServiceDuration);
                        }
                      }
                      onChange(event);
                    }}
                    ref={ref}
                    value={value}>
                    <SelectItem text={t('chooseService', 'Select service')} value="" />
                    {services?.length > 0 &&
                      services.map((service) => (
                        <SelectItem key={service.uuid} text={service.name} value={service.name}>
                          {service.name}
                        </SelectItem>
                      ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>
          <FormGroup className={styles.formGroup} legendText={t('appointmentType_title', 'Appointment Type')}>
            <ResponsiveWrapper>
              <Controller
                name="appointmentType"
                control={control}
                render={({ field: { onBlur, onChange, value, ref } }) => (
                  <Select
                    disabled={!appointmentTypes?.length}
                    id="appointmentType"
                    invalid={!!errors?.appointmentType}
                    invalidText={errors?.appointmentType?.message}
                    labelText={t('selectAppointmentType', 'Select the type of appointment')}
                    onBlur={onBlur}
                    onChange={onChange}
                    ref={ref}
                    value={value}>
                    <SelectItem text={t('chooseAppointmentType', 'Choose appointment type')} value="" />
                    {appointmentTypes?.length > 0 &&
                      appointmentTypes.map((appointmentType, index) => (
                        <SelectItem key={index} text={appointmentType} value={appointmentType}>
                          {appointmentType}
                        </SelectItem>
                      ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>

          <FormGroup className={styles.formGroup} legendText={t('recurringAppointment', 'Recurring Appointment')}>
            <div>
              <Toggle
                id="recurringToggle"
                labelB={t('yes', 'Yes')}
                labelA={t('no', 'No')}
                labelText={t('isRecurringAppointment', 'Is this a recurring appointment?')}
                onClick={() => setIsRecurringAppointment(!isRecurringAppointment)}
              />
            </div>
          </FormGroup>

          <FormGroup className={styles.formGroup} legendText={t('dateTime', 'Date & Time')}>
            <div className={styles.dateTimeFields}>
              {isRecurringAppointment && (
                <div className={styles.inputContainer}>
                  {allowAllDayAppointments && (
                    <Controller
                      name="isAllDayAppointment"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Toggle
                          id="allDayToggle"
                          labelA={t('no', 'No')}
                          labelB={t('yes', 'Yes')}
                          labelText={t('allDay', 'All day')}
                          toggled={value}
                          onToggle={onChange}
                        />
                      )}
                    />
                  )}
                  <ResponsiveWrapper>
                    <Controller
                      name="appointmentDateTime"
                      control={control}
                      render={({ field: { onChange, value }, fieldState }) => (
                        <OpenmrsDateRangePicker
                          value={
                            value.startDate && value.recurringPatternEndDate
                              ? [value.startDate, value.recurringPatternEndDate]
                              : null
                          }
                          onChange={(dateRange) => {
                            const [startDate, endDate] = dateRange;
                            onChange({
                              ...value,
                              startDate,
                              startDateText: startDate ? dayjs(startDate).format(dateFormat) : '',
                              recurringPatternEndDate: endDate,
                              recurringPatternEndDateText: endDate ? dayjs(endDate).format(dateFormat) : '',
                            });
                          }}
                          startName="start"
                          endName="end"
                          id="appointmentRecurringDateRangePicker"
                          data-testid="appointmentRecurringDateRangePicker"
                          labelText={t('dateRange', 'Set date range')}
                          invalid={!!fieldState?.error?.message}
                          invalidText={fieldState?.error?.message}
                          isRequired
                        />
                      )}
                    />
                  </ResponsiveWrapper>

                  {!watch('isAllDayAppointment') && <TimeAndDuration t={t} control={control} errors={errors} />}

                  <ResponsiveWrapper>
                    <Controller
                      name="recurringPatternPeriod"
                      control={control}
                      render={({ field: { onBlur, onChange, value } }) => (
                        <NumberInput
                          hideSteppers
                          id="repeatNumber"
                          min={1}
                          max={356}
                          label={t('repeatEvery', 'Repeat every')}
                          invalidText={t('invalidNumber', 'Number is not valid')}
                          value={value}
                          onBlur={onBlur}
                          onChange={(e, state) => {
                            const value = state?.value ?? (e.target as HTMLInputElement).value;
                            onChange(value === '' ? null : Number(value));
                          }}
                        />
                      )}
                    />
                  </ResponsiveWrapper>

                  <ResponsiveWrapper>
                    <Controller
                      name="recurringPatternType"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <RadioButtonGroup
                          legendText={t('period', 'Period')}
                          name="radio-button-group"
                          onChange={(type) => onChange(type)}
                          valueSelected={value}>
                          <RadioButton labelText={t('day', 'Day')} value="DAY" id="radioDay" />
                          <RadioButton labelText={t('week', 'Week')} value="WEEK" id="radioWeek" />
                        </RadioButtonGroup>
                      )}
                    />
                  </ResponsiveWrapper>

                  {watch('recurringPatternType') === 'WEEK' && (
                    <div>
                      <Controller
                        name="selectedDaysOfWeekText"
                        control={control}
                        defaultValue={defaultSelectedDaysOfWeekText}
                        render={({ field: { onChange } }) => (
                          <MultiSelect
                            className={styles.weekSelect}
                            id="daysOfWeek"
                            initialSelectedItems={weekDays.filter((i) =>
                              getValues('recurringPatternDaysOfWeek').includes(i.id),
                            )}
                            items={weekDays}
                            itemToString={(item) => (item ? t(item.labelCode, item.label) : '')}
                            label={getValues('selectedDaysOfWeekText')}
                            onChange={(e) => {
                              onChange(e);
                              handleSelectChange(e);
                            }}
                            selectionFeedback="top-after-reopen"
                            sortItems={(items) => {
                              return [...items].sort((a, b) => a.order - b.order);
                            }}
                          />
                        )}
                      />
                    </div>
                  )}
                </div>
              )}

              {!isRecurringAppointment && (
                <div className={styles.inputContainer}>
                  {allowAllDayAppointments && (
                    <Controller
                      name="isAllDayAppointment"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Toggle
                          id="allDayToggle"
                          labelA={t('no', 'No')}
                          labelB={t('yes', 'Yes')}
                          labelText={t('allDay', 'All day')}
                          toggled={value}
                          onToggle={onChange}
                        />
                      )}
                    />
                  )}
                  <ResponsiveWrapper>
                    <Controller
                      name="appointmentDateTime"
                      control={control}
                      render={({ field, fieldState }) => (
                        <OpenmrsDatePicker
                          data-testid="datePickerInput"
                          id="datePickerInput"
                          invalid={!!fieldState?.error?.message}
                          invalidText={fieldState?.error?.message}
                          labelText={t('date', 'Date')}
                          onBlur={field.onBlur}
                          onChange={(date) => {
                            field.onChange({
                              ...field.value,
                              startDate: date,
                            });
                          }}
                          style={{ width: '100%' }}
                          value={field.value.startDate}
                        />
                      )}
                    />
                  </ResponsiveWrapper>

                  {!watch('isAllDayAppointment') && <TimeAndDuration t={t} control={control} errors={errors} />}
                </div>
              )}
            </div>
          </FormGroup>

          {getValues('selectedService') && (
            <FormGroup className={styles.formGroup} legendText="">
              <ResponsiveWrapper>
                <Workload
                  appointmentDate={watch('appointmentDateTime').startDate}
                  onWorkloadDateChange={handleWorkloadDateChange}
                  selectedService={watch('selectedService')}
                />
              </ResponsiveWrapper>
            </FormGroup>
          )}

          {isEditing ? (
            <FormGroup className={styles.formGroup} legendText={t('appointmentStatus', 'Appointment Status')}>
              <ResponsiveWrapper>
                <Controller
                  name="appointmentStatus"
                  control={control}
                  render={({ field: { onBlur, onChange, value, ref } }) => (
                    <Select
                      id="appointmentStatus"
                      invalid={!!errors?.appointmentStatus}
                      invalidText={errors?.appointmentStatus?.message}
                      labelText={t('selectAppointmentStatus', 'Select status')}
                      onBlur={onBlur}
                      onChange={onChange}
                      ref={ref}
                      value={value}>
                      <SelectItem text={t('selectAppointmentStatus', 'Select status')} value="" />
                      {appointmentStatuses?.length > 0 &&
                        appointmentStatuses.map((appointmentStatus, index) => (
                          <SelectItem key={index} text={appointmentStatus} value={appointmentStatus}>
                            {appointmentStatus}
                          </SelectItem>
                        ))}
                    </Select>
                  )}
                />
              </ResponsiveWrapper>
            </FormGroup>
          ) : null}

          <FormGroup className={styles.formGroup} legendText={t('provider', 'Provider')}>
            <ResponsiveWrapper>
              <Controller
                name="provider"
                control={control}
                render={({ field: { onChange, value, onBlur, ref } }) => (
                  <Select
                    id="provider"
                    invalidText="Required"
                    labelText={t('selectProvider', 'Select a provider')}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={ref}
                    value={value}>
                    <SelectItem text={t('chooseProvider', 'Choose a provider')} value="" />
                    {providers?.providers?.length > 0 &&
                      providers?.providers?.map((provider) => (
                        <SelectItem key={provider.uuid} text={provider.display} value={provider.uuid}>
                          {provider.display}
                        </SelectItem>
                      ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>

          <FormGroup
            className={styles.formGroup}
            legendText={t('dateAppointmentScheduled', 'Date appointment scheduled')}>
            <ResponsiveWrapper>
              <Controller
                name="dateAppointmentScheduled"
                control={control}
                render={({ field, fieldState }) => (
                  <div style={{ width: '100%' }}>
                    <OpenmrsDatePicker
                      data-testid="dateAppointmentScheduledPickerInput"
                      id="dateAppointmentScheduledPickerInput"
                      invalid={!!fieldState?.error?.message}
                      invalidText={fieldState?.error?.message}
                      labelText={t('dateAppointmentIssued', 'Date appointment issued')}
                      maxDate={new Date()}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      style={{ width: '100%' }}
                      value={field.value}
                    />
                  </div>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>

          <FormGroup className={styles.formGroup} legendText={t('note', 'Note')}>
            <ResponsiveWrapper>
              <Controller
                name="appointmentNote"
                control={control}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <TextArea
                    enableCounter
                    id="appointmentNote"
                    value={value}
                    labelText={t('appointmentNoteLabel', 'Write an additional note')}
                    placeholder={t('appointmentNotePlaceholder', 'Write any additional points here')}
                    maxCount={255}
                    onChange={onChange}
                    onBlur={onBlur}
                    ref={ref}
                  />
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>
        </Stack>
        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button
            className={styles.button}
            onClick={() => closeWorkspace({ discardUnsavedChanges: true })}
            kind="secondary">
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} disabled={isSubmitting} type="submit">
            {t('saveAndClose', 'Save and close')}
          </Button>
        </ButtonSet>
      </Form>
    </Workspace2>
  );
};

/**
 * TimeAndDuration component for appointment form
 * Uses Record<string, any> for control/errors types since AppointmentFormData
 * is defined inside the parent component and cannot be referenced here.
 * Type safety is maintained at the call site.
 */
interface TimeAndDurationProps {
  t: ReturnType<typeof useTranslation>['t'];
  control: Control<Record<string, any>>;
  errors: FieldErrors<Record<string, any>>;
}

function TimeAndDuration({ t, control, errors }: TimeAndDurationProps) {
  return (
    <>
      <ResponsiveWrapper>
        <Controller
          name="startTime"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TimePicker
              id="time-picker"
              pattern={time12HourFormatRegexPattern}
              invalid={!!errors?.startTime}
              invalidText={errors?.startTime?.message ? String(errors.startTime.message) : undefined}
              labelText={t('time', 'Time')}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                onChange(event.target.value);
              }}
              style={{ marginLeft: '0.125rem', flex: 'none' }}
              value={value}>
              <Controller
                name="timeFormat"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <TimePickerSelect
                    id="time-picker-select-1"
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      onChange(event.target.value as 'AM' | 'PM')
                    }
                    value={value}
                    aria-label={t('time', 'Time')}>
                    <SelectItem value="AM" text="AM" />
                    <SelectItem value="PM" text="PM" />
                  </TimePickerSelect>
                )}
              />
            </TimePicker>
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Controller
          name="duration"
          control={control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <NumberInput
              allowEmpty
              disableWheel
              hideSteppers
              id="duration"
              invalid={!!errors?.duration}
              invalidText={errors?.duration?.message ? String(errors.duration.message) : undefined}
              label={t('durationInMinutes', 'Duration (minutes)')}
              onBlur={onBlur}
              onChange={(event, state) => {
                const value = state?.value ?? (event.target as HTMLInputElement).value;
                onChange(value === '' ? null : Number(value));
              }}
              ref={ref}
              value={value ?? ''}
            />
          )}
        />
      </ResponsiveWrapper>
    </>
  );
}

export default AppointmentsForm;

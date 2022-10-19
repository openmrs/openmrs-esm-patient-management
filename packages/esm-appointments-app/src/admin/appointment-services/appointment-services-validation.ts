import * as Yup from 'yup';
import { OpenmrsResource } from '@openmrs/esm-framework';

export const validationSchema = Yup.object({
  description: Yup.string().optional(),
  durationMins: Yup.number().required('durationMinsRequired'),
  endTime: Yup.string().required('endTimeRequired'),
  initialAppointmentStatus: Yup.string().optional(),
  location: Yup.object({ uuid: Yup.string(), display: Yup.string() }).required('locationRequired'),
  maxAppointmentsLimit: Yup.number().required('maxAppointmentLimitRequired'),
  name: Yup.string().required('appointmentServiceNameRequired'),
  specialityUuid: Yup.string().optional(),
  startTime: Yup.string().required('startTimeRequired'),
  color: Yup.string().required('colorRequired'),
  startTimeTimeFormat: Yup.string().required('startTimeFormatRequired'),
  endTimeTimeFormat: Yup.string().required('endTimeFormatRequired'),
});

import { useConfig } from '@openmrs/esm-framework';
import { createContext, type SetStateAction } from 'react';
import { type RegistrationConfig } from '../config-schema';
import { type CapturePhotoProps, type FormValues } from './patient-registration.types';

export interface PatientRegistrationContextProps {
  currentPhoto: string;
  identifierTypes: Array<any>;
  inEditMode: boolean;
  initialFormValues: FormValues;
  isOffline: boolean;
  setInitialFormValues?: React.Dispatch<SetStateAction<FormValues>>;
  validationSchema: any;
  values: FormValues;
  setCapturePhotoProps(value: SetStateAction<CapturePhotoProps>): void;
  setFieldValue(field: string, value: any, shouldValidate?: boolean): void;
  setFieldTouched(field: string, isTouched?: any, shouldValidate?: boolean): void;
}

export const PatientRegistrationContext = createContext<PatientRegistrationContextProps | undefined>(undefined);

export function useFieldConfig(field: string) {
  const { fieldConfigurations } = useConfig() as RegistrationConfig;
  return fieldConfigurations[field];
}

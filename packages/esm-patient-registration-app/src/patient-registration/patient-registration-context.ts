import { useConfig } from '@openmrs/esm-framework';
import { createContext, type SetStateAction } from 'react';
import { type RegistrationConfig } from '../config-schema';
import { type FormValues, type CapturePhotoProps } from './patient-registration.types';

export interface PatientRegistrationContextProps {
  identifierTypes: Array<any>;
  values: FormValues;
  validationSchema: any;
  setValidationSchema(value: any): void;
  inEditMode: boolean;
  setFieldValue(field: string, value: any, shouldValidate?: boolean): void;
  setCapturePhotoProps(value: SetStateAction<CapturePhotoProps>): void;
  currentPhoto: string;
  isOffline: boolean;
  initialFormValues: FormValues;
  setInitialFormValues?: React.Dispatch<SetStateAction<FormValues>>;
}

export const PatientRegistrationContext = createContext<PatientRegistrationContextProps | undefined>(undefined);

export function useFieldConfig(field: string) {
  const { fieldConfigurations } = useConfig() as RegistrationConfig;
  return fieldConfigurations[field];
}

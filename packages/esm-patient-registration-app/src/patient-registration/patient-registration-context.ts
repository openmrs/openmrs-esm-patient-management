import { createContext, type SetStateAction, useContext } from 'react';
import { type PatientIdentifierType, useConfig } from '@openmrs/esm-framework';
import { type CapturePhotoProps, type FormValues } from './patient-registration.types';
import { type RegistrationConfig } from '../config-schema';

export interface PatientRegistrationContextProps {
  currentPhoto: string;
  identifierTypes: Array<PatientIdentifierType>;
  inEditMode: boolean;
  initialFormValues: FormValues;
  isOffline: boolean;
  setCapturePhotoProps(value: SetStateAction<CapturePhotoProps>): void;
  setFieldTouched(field: string, isTouched?: any, shouldValidate?: boolean): void;
  setFieldValue(field: string, value: any, shouldValidate?: boolean): void;
  setInitialFormValues?: React.Dispatch<SetStateAction<FormValues>>;
  validationSchema: any;
  values: FormValues;
}

export const PatientRegistrationContext = createContext<PatientRegistrationContextProps | undefined>(undefined);

export const PatientRegistrationContextProvider = PatientRegistrationContext.Provider;

export const usePatientRegistrationContext = () => {
  const context = useContext(PatientRegistrationContext);
  if (!context) {
    throw new Error('usePatientRegistrationContext must be used within a PatientRegistrationContextProvider');
  }
  return context;
};

export function useFieldConfig(field: string) {
  const { fieldConfigurations } = useConfig<RegistrationConfig>();
  return fieldConfigurations[field];
}

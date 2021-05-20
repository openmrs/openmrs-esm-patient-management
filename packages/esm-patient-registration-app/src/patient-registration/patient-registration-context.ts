import React from 'react';
import { FormValues } from './patient-registration-types';

type PatientRegistrationContextProps = {
  identifierTypes: Array<any>;
  values: FormValues;
  validationSchema: any;
  setValidationSchema: (value: any) => void;
  inEditMode: boolean;
  fieldConfigs: Record<string, any>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
};

export const PatientRegistrationContext = React.createContext<PatientRegistrationContextProps | undefined>(undefined);

export const useFieldConfig = (field) => {
  const { fieldConfigs } = React.useContext(PatientRegistrationContext);
  return fieldConfigs[field];
};

import React, { createContext, useContext } from 'react';

export interface AddPatientToQueueContextProviderProps {
  currentServiceQueueUuid: string;
}

export const AddPatientToQueueContext = createContext<AddPatientToQueueContextProviderProps>({
  currentServiceQueueUuid: '',
});

export const AddPatientToQueueContextProvider = AddPatientToQueueContext.Provider;

export const useAddPatientToQueueContext = () => {
  const context = useContext(AddPatientToQueueContext);
  if (!context) {
    throw new Error('useAddPatientToQueueContext must be used within a AddPatientToQueueContextProvider');
  }
  return context;
};

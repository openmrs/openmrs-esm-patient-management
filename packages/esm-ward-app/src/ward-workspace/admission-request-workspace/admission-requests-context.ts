import { createContext, useContext } from 'react';
import { type DefaultWorkspaceProps } from '@openmrs/esm-framework';

export interface AdmissionRequestsWorkspaceContextProps extends DefaultWorkspaceProps {
  wardPendingPatients: React.ReactNode;
}

export const AdmissionRequestsWorkspaceContext = createContext<AdmissionRequestsWorkspaceContextProps>(null);

export const AdmissionRequestsWorkspaceContextProvider = AdmissionRequestsWorkspaceContext.Provider;

export const useAdmissionRequestsWorkspaceContext = () => {
  const context = useContext(AdmissionRequestsWorkspaceContext);
  if (!context) {
    throw new Error(
      'useAdmissionRequestsWorkspaceContext must be used within a AdmissionRequestsWorkspaceContextProvider',
    );
  }
  return context;
};

import { createContext, useContext } from 'react';
import { type Resources } from './registration.resource';

export const ResourcesContext = createContext<Resources>(null);

export const ResourcesContextProvider = ResourcesContext.Provider;

export const useResourcesContext = () => {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error('useResourcesContext must be used within a ResourcesContextProvider');
  }
  return context;
};

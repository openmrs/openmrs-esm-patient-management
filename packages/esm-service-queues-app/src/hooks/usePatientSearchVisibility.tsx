import { useCallback, useState } from 'react';

const usePatientSearchVisibility = () => {
  const [isOpen, setIsOpen] = useState(false);

  const showPatientSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const hidePatientSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const togglePatientSearch = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return {
    hidePatientSearch,
    isPatientSearchOpen: isOpen,
    showPatientSearch,
    togglePatientSearch,
  };
};

export default usePatientSearchVisibility;

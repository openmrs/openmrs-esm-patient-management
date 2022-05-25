import React from 'react';
import { LeftNavMenu, useOnClickOutside } from '@openmrs/esm-framework';

interface VisitHeaderSideMenu {
  isExpanded: boolean;
  toggleSideMenu: () => void;
}

const VisitHeaderSideMenu: React.FC<VisitHeaderSideMenu> = ({ isExpanded, toggleSideMenu }) => {
  const menuRef = useOnClickOutside(toggleSideMenu, isExpanded);

  React.useEffect(() => {
    window.addEventListener('popstate', toggleSideMenu);
    return window.addEventListener('popstate', toggleSideMenu);
  }, [toggleSideMenu]);

  return isExpanded ? <LeftNavMenu ref={menuRef} /> : null;
};

export default VisitHeaderSideMenu;

import React from 'react';
import { SideNav, SideNavItems } from 'carbon-components-react/lib/components/UIShell';
import { ExtensionSlot } from '@openmrs/esm-framework';
import styles from './side-menu.scss';

const SideMenu = () => {
  return (
    <SideNav
      isFixedNav
      expanded={true}
      isChildOfHeader={false}
      aria-label="Side navigation"
      className={styles.sideMenuContainer}>
      <SideNavItems>
        <ExtensionSlot extensionSlotName="appointments-dashboard-slot" />
      </SideNavItems>
    </SideNav>
  );
};

export default SideMenu;

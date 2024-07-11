import React, { useEffect } from "react";
import {
  attach,
  detach,
  ExtensionSlot,
  isDesktop,
  useLayoutType,
} from "@openmrs/esm-framework";
import { SideNav } from "@carbon/react";
import styles from "./left-panel.scss";

const LeftPanel: React.FC = () => {
  const layout = useLayoutType();

  useEffect(() => {
    attach("nav-menu-slot", "bed-management-left-panel");
    return () => detach("nav-menu-slot", "bed-management-left-panel");
  }, []);

  return (
    isDesktop(layout) && (
      <SideNav
        aria-label="Bed management left panel"
        className={styles.leftPanel}
        expanded
      >
        <ExtensionSlot name="bed-management-left-panel-slot" />
      </SideNav>
    )
  );
};

export default LeftPanel;

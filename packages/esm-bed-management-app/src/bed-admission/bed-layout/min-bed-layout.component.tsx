import React from "react";
import styles from "./bed-layout.scss";
import BedLayout from "./bed-layout.component";

const MinBedLayout: React.FC = () => {
  return (
    <div className={styles.bedInfoContainer}>
      <div className={styles.bedInfoMain}>
        <BedLayout
          bedPillowStyles={styles.minPillow}
          layOutStyles={styles.minOccupied}
        />{" "}
        <span className={styles.bedInfoText}>Occupied</span>
      </div>
      <div className={styles.bedInfoMain}>
        <BedLayout
          bedPillowStyles={styles.minPillow}
          layOutStyles={styles.minAvailable}
        />{" "}
        <span className={styles.bedInfoText}>Available</span>
      </div>
    </div>
  );
};

export default MinBedLayout;

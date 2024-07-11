import React from "react";
import styles from "./header.scss";
import { Stethoscope } from "@carbon/react/icons";

const Illustration: React.FC = () => {
  return (
    <div className={styles.svgContainer}>
      <Stethoscope className={styles.iconOverrides} />
    </div>
  );
};

export default Illustration;

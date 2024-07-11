import React from "react";
import BedManagementSummary from "./summary/summary.component";
import Header from "./header/header.component";
import styles from "./home.scss";

const Home: React.FC = () => {
  return (
    <section className={styles.section}>
      <Header route="Summary" />
      <BedManagementSummary />
    </section>
  );
};

export default Home;

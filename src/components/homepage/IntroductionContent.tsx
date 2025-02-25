import React from "react";
import styles from "./Introduction.module.scss";

interface IntroductionProps {
    heading: string;
    description: string;
  }
  

  const Introduction: React.FC<IntroductionProps> = ({ heading, description }) => {
    return (
    <div className={styles["introduction"]}>
      <h2 className={styles["introduction__heading"]}>{heading}</h2>
      <p className={styles["introduction__description"]}>
        {description}
      </p>
    </div>
  );
};

export default Introduction;
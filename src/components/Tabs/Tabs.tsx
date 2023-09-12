import React, { useState, ReactElement } from "react";
import styles from "./Tabs.module.scss";

interface TabsProps {
  children: ReactElement[];
  selected?: number;
}

const Tabs: React.FC<TabsProps> = ({ children, selected = 2 }) => {
  const [selectedIndex, setSelectedIndex] = useState(selected);

  const handleChange = (index: number) => {
    setSelectedIndex(index);
  };

  return (
    <>
      <ul className={styles["inline"]}>
        {children.map((elem, index) => {
          let style = index === selectedIndex ? styles["selected"] : "";
          return (
            <li
              key={index}
              className={style}
              onClick={() => handleChange(index)}
            >
              {elem.props.title}
            </li>
          );
        })}
      </ul>
      <div className={styles["tab"]}>{children[selectedIndex]}</div>
    </>
  );
};

export default Tabs;

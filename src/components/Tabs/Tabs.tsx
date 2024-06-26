import React, { useState, ReactElement } from "react";
import styles from "./Tabs.module.scss";

interface TabsProps {
  children: ReactElement[];
  onParentClick: Function,
  selected?: number;
}

const Tabs: React.FC<TabsProps> = ({ children, selected, onParentClick }) => {
  const [selectedIndex, setSelectedIndex] = useState(selected ? selected : 0);

  const handleChange = (index: number, title: string, value: string) => {
    setSelectedIndex(index);
    // If we want to do more than just change index, proceed with "onParentClick" and recieve title
    if(onParentClick){
      onParentClick(value);
    }
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
              onClick={() => handleChange(index, elem.props.title, elem.props.value)}
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
